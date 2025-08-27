import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { StudySession } from '@/models/StudySession'
import { UserProgress } from '@/models/UserProgress'

// GET /api/sessions - Get user's study sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const activityType = searchParams.get('activityType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const analytics = searchParams.get('analytics') === 'true'

    const userId = session.user.id

    if (analytics) {
      // Return study time analytics
      const days = parseInt(searchParams.get('days') || '30')
      const analyticsData = await StudySession.getStudyTimeAnalytics(userId, days)
      
      // Get weekly study patterns
      const weeklyPattern = await StudySession.aggregate([
        {
          $match: {
            userId,
            isActive: false,
            sessionStart: { 
              $gte: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)) 
            }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$sessionStart' },
            totalDuration: { $sum: '$duration' },
            sessionCount: { $sum: 1 },
            avgEngagement: { $avg: '$engagementScore' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])

      // Get activity type distribution
      const activityDistribution = await StudySession.aggregate([
        {
          $match: {
            userId,
            isActive: false,
            sessionStart: { 
              $gte: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)) 
            }
          }
        },
        {
          $group: {
            _id: '$activityType',
            totalDuration: { $sum: '$duration' },
            sessionCount: { $sum: 1 }
          }
        }
      ])

      return NextResponse.json({
        dailyAnalytics: analyticsData,
        weeklyPattern,
        activityDistribution
      })
    }

    const options = {
      limit,
      activityType: activityType || undefined
    }

    const sessions = await StudySession.getUserSessions(userId, options)

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Start a new study session
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id
    const body = await request.json()
    const { contentId, activityType, device = 'desktop' } = body

    if (!contentId || !activityType) {
      return NextResponse.json(
        { error: 'Content ID and activity type are required' },
        { status: 400 }
      )
    }

    // End any existing active sessions for this user
    await StudySession.updateMany(
      { userId, isActive: true },
      { 
        sessionEnd: new Date(),
        isActive: false
      }
    )

    // Create new session
    const newSession = new StudySession({
      userId,
      contentId,
      activityType,
      device,
      sessionStart: new Date(),
      isActive: true
    })

    await newSession.save()

    // Update user progress to mark content as accessed
    await UserProgress.findOneAndUpdate(
      { userId, contentId },
      {
        $set: {
          lastAccessedAt: new Date(),
          status: 'in_progress'
        },
        $setOnInsert: {
          userId,
          contentId,
          progressPercentage: 0,
          timeSpent: 0,
          sequencePosition: 1, // This should be set based on content
          isUnlocked: true
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ 
      success: true, 
      session: newSession,
      message: 'Study session started'
    })

  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

// PUT /api/sessions/[sessionId] - Update existing session
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const url = new URL(request.url)
    const sessionId = url.pathname.split('/').pop()
    const body = await request.json()
    
    const { 
      engagementScore,
      videoProgress,
      testSession,
      endSession = false
    } = body

    const userId = session.user.id

    // Verify session belongs to user
    const studySession = await StudySession.findOne({ 
      _id: sessionId, 
      userId 
    })

    if (!studySession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Update session data
    const updateData: Record<string, unknown> = {}

    if (engagementScore !== undefined) {
      updateData.engagementScore = engagementScore
    }

    if (videoProgress) {
      updateData.videoProgress = {
        ...studySession.videoProgress,
        ...videoProgress
      }
    }

    if (testSession) {
      updateData.testSession = {
        ...studySession.testSession,
        ...testSession
      }
    }

    if (endSession) {
      updateData.sessionEnd = new Date()
      updateData.isActive = false
      
      // Calculate final duration
      const durationMs = new Date().getTime() - studySession.sessionStart.getTime()
      updateData.duration = Math.round(durationMs / (1000 * 60)) // Convert to minutes
    }

    const updatedSession = await StudySession.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    )

    // If ending session, update user progress
    if (endSession) {
      await UserProgress.findOneAndUpdate(
        { userId, contentId: studySession.contentId },
        {
          $inc: { timeSpent: updateData.duration },
          $set: { lastAccessedAt: new Date() }
        }
      )
    }

    return NextResponse.json({ 
      success: true, 
      session: updatedSession,
      message: endSession ? 'Session ended' : 'Session updated'
    })

  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions - End all active sessions for user
export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // End all active sessions
    const result = await StudySession.updateMany(
      { userId, isActive: true },
      { 
        sessionEnd: new Date(),
        isActive: false
      }
    )

    return NextResponse.json({ 
      success: true, 
      endedSessions: result.modifiedCount,
      message: 'All active sessions ended'
    })

  } catch (error) {
    console.error('Error ending sessions:', error)
    return NextResponse.json(
      { error: 'Failed to end sessions' },
      { status: 500 }
    )
  }
}
