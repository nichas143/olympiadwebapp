import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/models/UserProgress'
import { Content } from '@/models/Content'

// GET /api/progress - Get user's attempt data
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
      // Return attempt summary
      const attemptSummary = await UserProgress.getProgressSummary(userId)
      const totalContent = await Content.countDocuments({ isActive: true })
      const attemptedContent = await UserProgress.countDocuments({ 
        userId, 
        status: 'attempted' 
      })
      
      return NextResponse.json({
        summary: attemptSummary,
        totalContent,
        attemptedContent,
        attemptRate: totalContent > 0 ? Math.round((attemptedContent / totalContent) * 100) : 0
      })
    }

    if (contentId) {
      // Get attempt status for specific content
      const progress = await UserProgress.findOne({ userId, contentId })
      return NextResponse.json({ progress })
    }

    if (unit) {
      // Get attempt status for specific unit
      const unitProgress = await UserProgress.getUnitProgress(userId, unit)
      return NextResponse.json({ unitProgress })
    }

    // Get all user progress
    const allProgress = await UserProgress.getUserProgress(userId, { sort: { lastAccessedAt: -1 } })
    
    // Populate content information for each progress record
    const progressWithContent = await Promise.all(
      allProgress.map(async (progress) => {
        const content = await Content.findById(progress.contentId).select('concept unit contentType')
        return {
          ...progress.toObject(),
          content: content ? {
            concept: content.concept,
            unit: content.unit,
            contentType: content.contentType
          } : null
        }
      })
    )
    
    return NextResponse.json({ progress: progressWithContent })

  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST /api/progress - Update user attempt status
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
      status,
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

    // Update attempt status
    if (status) {
      progress.status = status
    }

    // Update notes
    if (notes !== undefined) {
      progress.notes = notes
    }

    // Update bookmark status
    if (isBookmarked !== undefined) {
      progress.isBookmarked = isBookmarked
    }

    progress.lastAccessedAt = new Date()

    await progress.save()

    return NextResponse.json({ 
      success: true, 
      progress,
      message: 'Attempt status updated successfully'
    })

  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// PUT /api/progress - Bulk update attempt status (for admin or system operations)
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
      message: 'Bulk attempt status update completed'
    })

  } catch (error) {
    console.error('Error in bulk progress update:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
