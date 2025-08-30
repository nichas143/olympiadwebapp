import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/models/UserProgress'

// Enable Next.js caching for this route
export const revalidate = 60 // Revalidate every 1 minute for progress data
export const dynamic = 'force-dynamic'

// GET /api/progress/cached - Get cached progress for multiple content items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const contentIds = searchParams.get('contentIds') // Comma-separated list of content IDs

    if (!contentIds) {
      return NextResponse.json({ error: 'Content IDs are required' }, { status: 400 })
    }

    const contentIdArray = contentIds.split(',').filter(id => id.trim())

    // Fetch all progress records for the user and content IDs in one query
    const progressRecords = await UserProgress.find({
      userId: session.user.id,
      contentId: { $in: contentIdArray }
    }).select('contentId status completedAt')

    // Create a map for quick lookup
    const progressMap = new Map()
    progressRecords.forEach(record => {
      progressMap.set(record.contentId.toString(), {
        status: record.status,
        completedAt: record.completedAt
      })
    })

    // Create response object with progress for each content ID
    const progressData = {}
    contentIdArray.forEach(contentId => {
      progressData[contentId] = progressMap.get(contentId) || {
        status: 'not_attempted',
        completedAt: null
      }
    })

    return NextResponse.json({
      progress: progressData,
      cachedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120', // 1 min cache, 2 min stale
      }
    })
  } catch (error) {
    console.error('Error fetching cached progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
