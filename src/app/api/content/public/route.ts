import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'

// GET /api/content/public - Get public prerequisite content (no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'Pre-requisite'
    const contentType = searchParams.get('contentType') || 'video'
    const sortBy = searchParams.get('sortBy') || 'sequence'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Only allow access to prerequisite content for public endpoint
    if (level !== 'Pre-requisite') {
      return NextResponse.json({ error: 'Only prerequisite content is available publicly' }, { status: 403 })
    }

    // Build query for public prerequisite content
    const query: Record<string, unknown> = { 
      isActive: true,
      level: 'Pre-requisite',
      contentType: contentType,
      // Only show content that is marked for public access
      isPublicAccess: true
    }

    // Determine sort order
    let sortOrder: Record<string, 1 | -1>
    switch (sortBy) {
      case 'sequence':
        sortOrder = { sequenceNo: 1, unit: 1, chapter: 1, topic: 1 }
        break
      case 'newest':
        sortOrder = { createdAt: -1 }
        break
      case 'alphabetical':
        sortOrder = { unit: 1, chapter: 1, topic: 1, concept: 1 }
        break
      default:
        sortOrder = { sequenceNo: 1, unit: 1, chapter: 1, topic: 1 }
    }

    const content = await Content.find(query)
      .sort(sortOrder)
      .limit(limit)
      .select('_id unit chapter topic concept contentType instructionType level duration videoLink description sequenceNo docCategory createdAt updatedAt isActive videoAccessLevel requiresSubscription isPublicAccess')

    const total = await Content.countDocuments(query)

    return NextResponse.json({
      content,
      pagination: {
        total,
        limit,
        hasMore: total > limit
      }
    })
  } catch (error) {
    console.error('Error fetching public prerequisite content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
