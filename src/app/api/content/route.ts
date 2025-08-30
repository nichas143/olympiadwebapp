import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'

// GET /api/content - Get content with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit')
    const contentType = searchParams.get('contentType')
    const instructionType = searchParams.get('instructionType')
    const docCategory = searchParams.get('docCategory')
    const chapter = searchParams.get('chapter')
    const topic = searchParams.get('topic')
    const sortBy = searchParams.get('sortBy') || 'sequence' // Default sort by sequence
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = { isActive: true }
    
    if (unit) query.unit = unit
    if (contentType) query.contentType = contentType
    if (instructionType) query.instructionType = instructionType
    if (docCategory) query.docCategory = docCategory
    if (chapter) query.chapter = new RegExp(chapter, 'i') // Case-insensitive search
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

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/content - Create new content (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
    }

    const contentData = await request.json()

    // Validate required fields
    const requiredFields = ['unit', 'chapter', 'topic', 'concept', 'contentType', 'instructionType', 'duration', 'description', 'sequenceNo', 'docCategory']
    for (const field of requiredFields) {
      if (!contentData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate video link for Learning category
    if (contentData.docCategory === 'Learning' && !contentData.videoLink) {
      return NextResponse.json({ error: 'Link is required for Learning category content' }, { status: 400 })
    }

    // Validate noOfProblems for MockTest and PracticeSet
    if ((contentData.docCategory === 'MockTest' || contentData.docCategory === 'PracticeSet') && !contentData.noOfProblems) {
      return NextResponse.json({ error: 'Number of problems is required for MockTest and PracticeSet' }, { status: 400 })
    }

    // Validate sequenceNo is a positive number
    if (contentData.sequenceNo <= 0) {
      return NextResponse.json({ error: 'Sequence number must be a positive number' }, { status: 400 })
    }

    await connectDB()

    // Create new content
    const newContent = await Content.create({
      ...contentData,
      createdBy: session.user.id
    })

    // Invalidate cache after creating new content
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/content/cache-invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('Failed to invalidate cache:', error)
    }

    return NextResponse.json({ 
      message: 'Content created successfully',
      content: newContent
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating content:', error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: (error as unknown as { errors: unknown }).errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
