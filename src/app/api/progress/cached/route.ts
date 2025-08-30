import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/models/UserProgress'

// Enable Next.js caching for this route
export const revalidate = 60 // Revalidate every 1 minute for progress data
export const dynamic = 'force-dynamic'

// GET /api/progress/cached - Get cached progress for multiple content items or summary
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const summary = searchParams.get('summary')
    const contentIds = searchParams.get('contentIds') // Comma-separated list of content IDs

    // Handle summary request
    if (summary === 'true') {
      // Get progress summary for dashboard
      const summaryData = await UserProgress.aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])

      // Get total content count
      const { Content } = await import('@/models/Content')
      const totalContent = await Content.countDocuments({ isActive: true })

      // Calculate attempt rate
      const attemptedCount = summaryData.find(item => item._id === 'attempted')?.count || 0
      const attemptRate = totalContent > 0 ? Math.round((attemptedCount / totalContent) * 100) : 0

      return NextResponse.json({
        summary: summaryData,
        totalContent,
        attemptedContent: attemptedCount,
        attemptRate,
        cachedAt: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600', // Changed to private
        }
      })
    }

    // Handle individual content progress
    if (!contentIds) {
      return NextResponse.json({ error: 'Content IDs are required for individual progress' }, { status: 400 })
    }

    const contentIdArray = contentIds.split(',').filter(id => id.trim())

    // Fetch all progress records for the user and content IDs in one query
    const progressRecords = await UserProgress.find({
      userId: session.user.id,
      contentId: { $in: contentIdArray }
    }).select('contentId status attemptedAt')

    // Create a map for quick lookup
    const progressMap = new Map()
    progressRecords.forEach(record => {
      progressMap.set(record.contentId.toString(), {
        status: record.status,
        attemptedAt: record.attemptedAt
      })
    })

    // Create response object with progress for each content ID
    const progressData: Record<string, { status: string; attemptedAt: Date | null }> = {}
    contentIdArray.forEach(contentId => {
      progressData[contentId] = progressMap.get(contentId) || {
        status: 'not_attempted',
        attemptedAt: null
      }
    })

    return NextResponse.json({
      progress: progressData,
      cachedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120', // Changed to private
      }
    })
  } catch (error) {
    console.error('Error fetching cached progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
