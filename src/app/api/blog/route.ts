import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Blog, IBlog } from '@/models/Blog'
import { z } from 'zod'

// Base validation schema
const baseBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1), // Allow any content length for drafts
  excerpt: z.string().min(1).max(500),
  tags: z.array(z.string()).max(10).optional().default([]),
  category: z.enum(['Mathematics', 'Olympiad', 'Problem Solving', 'Study Tips', 'Announcements', 'General']),
  status: z.enum(['draft', 'published']).default('draft'),
  featuredImage: z.string().url().optional(),
  readTime: z.number().min(1).max(120),
  isPublic: z.boolean().default(true),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).max(15).optional().default([])
})

// Validation schemas with content length validation
const createBlogSchema = baseBlogSchema.refine((data) => {
  // Only require 100+ characters for published blogs
  if (data.status === 'published' && data.content.length < 100) {
    return false
  }
  return true
}, {
  message: "Content must be at least 100 characters for published blogs",
  path: ["content"]
})

const updateBlogSchema = baseBlogSchema.partial().refine((data) => {
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
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let finalSlug = slug
  let counter = 1
  
  while (true) {
    const existingBlog = await Blog.findOne({ 
      slug: finalSlug,
      ...(excludeId && { _id: { $ne: excludeId } })
    })
    
    if (!existingBlog) {
      break
    }
    
    finalSlug = `${slug}-${counter}`
    counter++
  }
  
  return finalSlug
}

// GET /api/blog - Get all published blogs (public) or all blogs (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    
    const session = await auth()
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'
    
    // Build query
    const query: Record<string, unknown> = {}
    
    // If not admin, only show published and public blogs
    if (!isAdmin) {
      query.status = 'published'
      query.isPublic = true
    } else if (status) {
      query.status = status
    }
    
    if (category) query.category = category
    if (tag) query.tags = { $in: [tag] }
    
    // Handle search
    let searchQuery = query
    if (search) {
      if (isAdmin) {
        searchQuery = {
          ...query,
          $text: { $search: search }
        }
      } else {
        searchQuery = {
          ...query,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }
      }
    }
    
    const skip = (page - 1) * limit
    
    // Execute query
    let blogs
    if (search && isAdmin) {
      blogs = await Blog.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
    } else {
      blogs = await Blog.find(searchQuery)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
    }
    
    const total = await Blog.countDocuments(searchQuery)
    
    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create new blog (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const body = await request.json()
    console.log('Received blog data:', JSON.stringify(body, null, 2))
    const validatedData = createBlogSchema.parse(body)
    console.log('Validated blog data:', JSON.stringify(validatedData, null, 2))
    
    // Generate slug from title
    const baseSlug = generateSlug(validatedData.title)
    const slug = await ensureUniqueSlug(baseSlug)
    
    const blogData = {
      ...validatedData,
      slug,
      author: session.user.name || 'Admin',
      authorId: session.user.id || session.user.email || 'unknown'
    }
    
    console.log('Blog data to save:', JSON.stringify(blogData, null, 2))
    const blog = new Blog(blogData)
    await blog.save()
    console.log('Blog saved successfully:', blog._id)
    
    return NextResponse.json({
      success: true,
      blog,
      message: 'Blog created successfully'
    })
  } catch (error) {
    console.error('Error creating blog:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
