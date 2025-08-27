import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Achievement, IAchievement } from '@/models/Achievement'
import { UserProgress } from '@/models/UserProgress'
import { StudySession } from '@/models/StudySession'

interface NewAchievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
}

// POST /api/achievements/check - Check and update achievements based on progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id
    const body = await request.json()
    const { progressData } = body

    const newAchievements: NewAchievement[] = []

    // Get user's current achievements
    const userAchievements = await Achievement.find({ userId })
    
    // Get user's progress summary
    const progressSummary = await UserProgress.getProgressSummary(userId)
    
    // Get study time analytics
    const studyTimeResult = await StudySession.aggregate([
      { $match: { userId, isActive: false } },
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
    ])
    const totalStudyTime = studyTimeResult[0]?.totalMinutes || 0

    // Get consecutive days streak
    const recentSessions = await StudySession.getUserSessions(userId, { 
      limit: 30,
      isActive: false 
    })
    
    // Calculate consecutive days
    const sessionDates = recentSessions.map(s => 
      s.sessionStart.toISOString().split('T')[0]
    )
    const uniqueDates = [...new Set(sessionDates)].sort()
    let consecutiveDays = 0
    let currentStreak = 0
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i])
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - (uniqueDates.length - 1 - i))
      
      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++
      } else {
        break
      }
    }
    consecutiveDays = currentStreak

    // Check each achievement type
    for (const achievement of userAchievements as IAchievement[]) {
      if (achievement.isUnlocked) continue // Skip already unlocked achievements

      let shouldUnlock = false
      let newProgress = achievement.currentProgress

      switch (achievement.criteria.type) {
        case 'consecutive_days':
          newProgress = consecutiveDays
          shouldUnlock = consecutiveDays >= achievement.criteria.value
          break

        case 'content_completed':
          const completedCount = progressSummary.find(p => p._id === 'completed')?.count || 0
          newProgress = completedCount
          shouldUnlock = completedCount >= achievement.criteria.value
          break

        case 'unit_completed':
          // Check if any unit is fully completed
          const unitProgress = await UserProgress.aggregate([
            {
              $lookup: {
                from: 'contents',
                localField: 'contentId',
                foreignField: '_id',
                as: 'content'
              }
            },
            {
              $match: {
                userId,
                status: 'completed',
                'content.unit': { $exists: true }
              }
            },
            {
              $group: {
                _id: '$content.unit',
                totalContent: { $sum: 1 },
                completedContent: { $sum: 1 }
              }
            },
            {
              $match: {
                $expr: { $eq: ['$totalContent', '$completedContent'] }
              }
            }
          ])
          newProgress = unitProgress.length
          shouldUnlock = unitProgress.length >= achievement.criteria.value
          break

        case 'test_score':
          if (progressData?.testScore) {
            newProgress = Math.max(achievement.currentProgress, progressData.testScore)
            shouldUnlock = progressData.testScore >= achievement.criteria.value
          }
          break

        case 'study_time':
          newProgress = totalStudyTime
          shouldUnlock = totalStudyTime >= achievement.criteria.value
          break

        case 'custom':
          // Handle custom achievement criteria
          break
      }

      // Update achievement progress
      if (newProgress !== achievement.currentProgress) {
        achievement.currentProgress = newProgress
        
        if (shouldUnlock) {
          achievement.isUnlocked = true
          achievement.unlockedAt = new Date()
          newAchievements.push({
            id: (achievement._id as string).toString(),
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points
          })
        }
        
        await achievement.save()
      }
    }

    return NextResponse.json({
      success: true,
      newAchievements,
      totalAchievements: userAchievements.filter(a => a.isUnlocked).length,
      totalPoints: userAchievements
        .filter(a => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0)
    })

  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}

// GET /api/achievements/check - Get user's achievements summary
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Get user's achievements
    const achievements = await Achievement.find({ userId })
    
    // Get progress summary
    const progressSummary = await UserProgress.getProgressSummary(userId)
    
    // Get study time
    const studyTimeResult = await StudySession.aggregate([
      { $match: { userId, isActive: false } },
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
    ])
    const totalStudyTime = studyTimeResult[0]?.totalMinutes || 0

    return NextResponse.json({
      achievements: achievements.map(a => ({
        id: a._id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        type: a.achievementType,
        criteria: a.criteria,
        currentProgress: a.currentProgress,
        isUnlocked: a.isUnlocked,
        unlockedAt: a.unlockedAt,
        points: a.points
      })),
      summary: {
        totalAchievements: achievements.length,
        unlockedAchievements: achievements.filter(a => a.isUnlocked).length,
        totalPoints: achievements
          .filter(a => a.isUnlocked)
          .reduce((sum, a) => sum + a.points, 0),
        progressSummary,
        totalStudyTime
      }
    })

  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
