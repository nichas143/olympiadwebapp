import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Blog } from '@/models/Blog'
import { z } from 'zod'
import mongoose from 'mongoose'

const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(), // Allow any content length for drafts
  excerpt: z.string().min(1).max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.enum(['Mathematics', 'Olympiad', 'Problem Solving', 'Study Tips', 'Announcements', 'General']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featuredImage: z.string().url().optional(),
  readTime: z.number().min(1).max(120).optional(),
  isPublic: z.boolean().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).max(15).optional()
}).refine((data) => {
  // Only require 100+ characters for published blogs
  if (data.status === 'published' && data.content && data.content.length < 100) {
    return false
  }
  return true
}, {
  message: "Content must be at least 100 characters for published blogs",
  path: ["content"]
})

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(slug: string, excludeId: string): Promise<string> {
  let finalSlug = slug
  let counter = 1
  
  while (true) {
    const existingBlog = await Blog.findOne({ 
      slug: finalSlug,
      _id: { $ne: excludeId }
    })
    
    if (!existingBlog) {
      break
    }
    
    finalSlug = `${slug}-${counter}`
    counter++
  }
  
  return finalSlug
}

// GET /api/blog/[id] - Get single blog by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const session = await auth()
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'
    
    // Try to find by ID first, then by slug
    let blog
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id)
    } else {
      blog = await Blog.findOne({ slug: id })
    }
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    console.log('GET - Blog found:', {
      id: blog._id,
      title: blog.title,
      content: blog.content,
      contentLength: blog.content?.length
    })
    
    // Check if user can access this blog
    if (!isAdmin && (blog.status !== 'published' || !blog.isPublic)) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    // Increment view count for published blogs
    if (blog.status === 'published' && blog.isPublic) {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
      blog.views += 1
    }
    
    return NextResponse.json({
      success: true,
      blog
    })
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/[id] - Update blog (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    console.log('Update - Received blog data:', JSON.stringify(body, null, 2))
    const validatedData = updateBlogSchema.parse(body)
    console.log('Update - Validated blog data:', JSON.stringify(validatedData, null, 2))
    
    // Find existing blog
    const existingBlog = await Blog.findById(id)
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    // Generate new slug if title is being updated
    let slug = existingBlog.slug
    if (validatedData.title && validatedData.title !== existingBlog.title) {
      const baseSlug = generateSlug(validatedData.title)
      slug = await ensureUniqueSlug(baseSlug, id)
    }
    
    const updateData = {
      ...validatedData,
      ...(slug !== existingBlog.slug && { slug })
    }
    console.log('Update - Data to save:', JSON.stringify(updateData, null, 2))
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    console.log('Update - Blog updated successfully:', blog?._id)
    
    return NextResponse.json({
      success: true,
      blog,
      message: 'Blog updated successfully'
    })
  } catch (error) {
    console.error('Error updating blog:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[id] - Delete blog (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const { id } = await params
    
    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
}
