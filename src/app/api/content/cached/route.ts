import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'

// Enable Next.js caching for this route
export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic' // Force dynamic rendering for authenticated requests

// GET /api/content/cached - Get cached content with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit')
    const contentType = searchParams.get('contentType')
    const instructionType = searchParams.get('instructionType')
    const docCategory = searchParams.get('docCategory')
    const chapter = searchParams.get('chapter')
    const topic = searchParams.get('topic')
    const sortBy = searchParams.get('sortBy') || 'sequence'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Increased limit for better caching
    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = { isActive: true }
    
    if (unit) query.unit = unit
    if (contentType) query.contentType = contentType
    if (instructionType) query.instructionType = instructionType
    if (docCategory) query.docCategory = docCategory
    if (chapter) query.chapter = new RegExp(chapter, 'i')
    if (topic) query.topic = new RegExp(topic, 'i')

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
      .skip(skip)
      .limit(limit)

    const total = await Content.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Create a cache key based on the query parameters
    const cacheKey = `content-${JSON.stringify(query)}-${sortBy}-${page}-${limit}`

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      cacheKey,
      cachedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600', // Changed to private for authenticated requests
        'CDN-Cache-Control': 'private, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'private, s-maxage=300'
      }
    })
  } catch (error) {
    console.error('Error fetching cached content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
