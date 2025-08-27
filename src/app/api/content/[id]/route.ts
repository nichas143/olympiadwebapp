import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'

// GET /api/content/[id] - Get specific content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const content = await Content.findById(id)
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/content/[id] - Update content (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
    }

    const updates = await request.json()

    await connectDB()

    const { id } = await params
    const content = await Content.findById(id)
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Update content
    Object.assign(content, updates)
    await content.save()

    return NextResponse.json({ 
      message: 'Content updated successfully',
      content
    })
  } catch (error) {
    console.error('Error updating content:', error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: (error as unknown as { errors: unknown }).errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/content/[id] - Delete content (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const content = await Content.findById(id)
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    content.isActive = false
    await content.save()

    return NextResponse.json({ 
      message: 'Content deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
