import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/models/UserProgress'
import { Content } from '@/models/Content'
import { StudySession } from '@/models/StudySession'

// GET /api/progress - Get user's progress data
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const unit = searchParams.get('unit')
    const summary = searchParams.get('summary') === 'true'

    const userId = session.user.id

    if (summary) {
      // Return progress summary
      const progressSummary = await UserProgress.getProgressSummary(userId)
      const totalProgress = await UserProgress.countDocuments({ userId })
      const completedProgress = await UserProgress.countDocuments({ 
        userId, 
        status: 'completed' 
      })
      
      // Get recent study sessions
      const recentSessions = await StudySession.getUserSessions(userId, { 
        limit: 10,
        isActive: false 
      })

      // Calculate total study time
      const studyTimeResult = await StudySession.aggregate([
        { $match: { userId, isActive: false } },
        { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
      ])

      const totalStudyTime = studyTimeResult[0]?.totalMinutes || 0

      return NextResponse.json({
        summary: progressSummary,
        totalContent: totalProgress,
        completedContent: completedProgress,
        completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0,
        totalStudyTime,
        recentSessions
      })
    }

    if (contentId) {
      // Get progress for specific content
      const progress = await UserProgress.findOne({ userId, contentId })
      return NextResponse.json({ progress })
    }

    if (unit) {
      // Get progress for specific unit
      const unitProgress = await UserProgress.getUnitProgress(userId, unit)
      return NextResponse.json({ unitProgress })
    }

    // Get all user progress
    const allProgress = await UserProgress.getUserProgress(userId)
    return NextResponse.json({ progress: allProgress })

  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST /api/progress - Update user progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id
    const body = await request.json()
    const { 
      contentId, 
      progressPercentage, 
      timeSpent, 
      status,
      videoWatchTime,
      videoCompletionPercentage,
      testScore,
      correctAnswers,
      totalQuestions,
      notes,
      isBookmarked
    } = body

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Verify content exists
    const content = await Content.findById(contentId)
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Find existing progress or create new
    let progress = await UserProgress.findOne({ userId, contentId })
    
    if (!progress) {
      // Create new progress record
      progress = new UserProgress({
        userId,
        contentId,
        sequencePosition: content.sequenceNo,
        isUnlocked: true // For now, unlock all content. You can implement sequential unlocking later
      })
    }

    // Update progress fields
    if (progressPercentage !== undefined) {
      progress.progressPercentage = Math.max(progress.progressPercentage, progressPercentage)
    }
    
    if (timeSpent !== undefined) {
      progress.timeSpent += timeSpent
    }

    if (status) {
      progress.status = status
    }

    if (videoWatchTime !== undefined) {
      progress.videoWatchTime = Math.max(progress.videoWatchTime || 0, videoWatchTime)
    }

    if (videoCompletionPercentage !== undefined) {
      progress.videoCompletionPercentage = Math.max(
        progress.videoCompletionPercentage || 0, 
        videoCompletionPercentage
      )
    }

    if (testScore !== undefined) {
      progress.testScore = Math.max(progress.testScore || 0, testScore)
      progress.testAttempts = (progress.testAttempts || 0) + 1
      progress.testCompletedAt = new Date()
    }

    if (correctAnswers !== undefined) {
      progress.correctAnswers = correctAnswers
    }

    if (totalQuestions !== undefined) {
      progress.totalQuestions = totalQuestions
    }

    if (notes !== undefined) {
      progress.notes = notes
    }

    if (isBookmarked !== undefined) {
      progress.isBookmarked = isBookmarked
    }

    progress.lastAccessedAt = new Date()

    await progress.save()

    return NextResponse.json({ 
      success: true, 
      progress,
      message: 'Progress updated successfully'
    })

  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// PUT /api/progress - Bulk update progress (for admin or system operations)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { userId, progressUpdates } = body

    if (!userId || !Array.isArray(progressUpdates)) {
      return NextResponse.json(
        { error: 'User ID and progress updates array are required' },
        { status: 400 }
      )
    }

    const results = []

    for (const update of progressUpdates) {
      try {
        const progress = await UserProgress.findOneAndUpdate(
          { userId, contentId: update.contentId },
          { ...update, lastAccessedAt: new Date() },
          { new: true, upsert: true }
        )
        results.push({ contentId: update.contentId, success: true, progress })
      } catch (error) {
        results.push({ 
          contentId: update.contentId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Bulk progress update completed'
    })

  } catch (error) {
    console.error('Error in bulk progress update:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
