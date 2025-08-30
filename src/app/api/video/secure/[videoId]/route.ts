import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import youtubeService from '@/lib/youtube'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { videoId } = await params
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check user subscription status (similar to your existing middleware)
    const subscriptionStatus = session.user.subscriptionStatus
    const freeAccess = process.env.FREE_ACCESS === 'true'
    
    if (!freeAccess && !['trial', 'active'].includes(subscriptionStatus || '')) {
      return NextResponse.json(
        { error: 'Active subscription required to access videos' },
        { status: 403 }
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

    // Generate secure embed URL with time-limited access
    const secureEmbedUrl = youtubeService.generateSecureEmbedUrl(
      videoId, 
      session.user.id, 
      session.user.role || 'student'
    )

    // Get thumbnails
    const thumbnails = youtubeService.getVideoThumbnails(videoId)

    // Log video access for analytics
    await youtubeService.logVideoAccess({
      videoId,
      userId: session.user.id,
      userRole: session.user.role || 'student',
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
        secureEmbedUrl,
        thumbnails,
        duration: metadata.duration,
        privacyStatus: metadata.privacyStatus,
        publishedAt: metadata.publishedAt,
        accessInfo: {
          userId: session.user.id,
          userRole: session.user.role,
          accessGrantedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        }
      }
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-src 'self' https://www.youtube.com https://youtube.com; default-src 'self';"
      }
    })

  } catch (error) {
    console.error('Error generating secure video access:', error)
    
    // Log security-related errors
    if (error instanceof Error && error.message.includes('private')) {
      console.warn('Attempted access to private video:', { 
        videoId: (await params).videoId,
        userId: (await auth())?.user?.id,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate secure video access' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
