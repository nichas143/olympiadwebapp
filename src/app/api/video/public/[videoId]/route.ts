import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'
import youtubeService from '@/lib/youtube'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify this is a prerequisite video that allows public access
    const content = await Content.findOne({
      videoLink: { $regex: videoId },
      level: 'Pre-requisite',
      isActive: true,
      isPublicAccess: true
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Video not found or not available for public access' },
        { status: 404 }
      )
    }

    // Validate domain restrictions
    const referrer = request.headers.get('referer') || request.headers.get('origin') || ''
    if (!youtubeService.validateDomain(referrer)) {
      return NextResponse.json(
        { error: 'Access denied from this domain' },
        { status: 403 }
      )
    }

    // Validate video access and get metadata
    const videoAccess = await youtubeService.validateVideoAccess(videoId)
    
    if (!videoAccess.accessible) {
      return NextResponse.json(
        { error: `Video access denied: ${videoAccess.reason}` },
        { status: 404 }
      )
    }

    if (!videoAccess.embeddable) {
      return NextResponse.json(
        { error: `Video cannot be embedded: ${videoAccess.reason}` },
        { status: 403 }
      )
    }

    // Get video metadata
    const metadata = await youtubeService.getVideoMetadata(videoId)

    // Generate public embed URL (no user-specific restrictions for prerequisites)
    const publicEmbedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`

    // Get thumbnails
    const thumbnails = youtubeService.getVideoThumbnails(videoId)

    // Log public video access for analytics
    await youtubeService.logVideoAccess({
      videoId,
      userId: 'public', // Special identifier for public access
      userRole: 'public',
      action: 'view',
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    })

    return NextResponse.json({
      success: true,
      data: {
        videoId,
        title: metadata.title,
        description: metadata.description,
        embedUrl: publicEmbedUrl,
        thumbnails,
        duration: metadata.duration,
        privacyStatus: metadata.privacyStatus,
        publishedAt: metadata.publishedAt,
        contentInfo: {
          concept: content.concept,
          chapter: content.chapter,
          topic: content.topic,
          unit: content.unit,
          level: content.level
        },
        accessInfo: {
          accessType: 'public',
          accessGrantedAt: new Date().toISOString()
        }
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour for public content
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-src 'self' https://www.youtube.com https://youtube.com; default-src 'self';"
      }
    })

  } catch (error) {
    console.error('Error generating public video access:', error)
    
    // Log security-related errors
    if (error instanceof Error && error.message.includes('private')) {
      console.warn('Attempted public access to private video:', { 
        videoId: (await params).videoId,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate public video access' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
