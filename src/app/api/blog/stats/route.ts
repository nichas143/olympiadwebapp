import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Blog } from '@/models/Blog'

// GET /api/blog/stats - Get blog statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    // Get overall statistics
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          avgReadTime: { $avg: '$readTime' }
        }
      }
    ])
    
    // Get category-wise statistics
    const categoryStats = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ])
    
    // Get author-wise statistics
    const authorStats = await Blog.aggregate([
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    // Get recent activity
    const recentBlogs = await Blog.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt author')
    
    // Get popular blogs (by views)
    const popularBlogs = await Blog.find({ status: 'published', isPublic: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views publishedAt')
    
    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0,
        avgReadTime: 0
      },
      categoryStats,
      authorStats,
      recentBlogs,
      popularBlogs
    })
  } catch (error) {
    console.error('Error fetching blog stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog statistics' },
      { status: 500 }
    )
  }
}
