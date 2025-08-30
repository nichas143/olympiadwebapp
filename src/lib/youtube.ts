import { google } from 'googleapis'
import jwt from 'jsonwebtoken'

// YouTube service for accessing private/unlisted videos with enhanced security
class YouTubeService {
  private youtube: any // eslint-disable-line @typescript-eslint/no-explicit-any
  private auth: any // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    this.initializeAuth()
  }

  private initializeAuth() {
    try {
      // Use service account credentials from environment variables (same as Google Drive)
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      
      if (!serviceAccountKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
      }

      const credentials = JSON.parse(serviceAccountKey)
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/youtube.force-ssl'
        ]
      })

      this.youtube = google.youtube({ version: 'v3', auth: this.auth })
    } catch (error) {
      console.error('Failed to initialize YouTube service:', error)
      throw error
    }
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/v\/([^"&?\/\s]{11})/,
      /youtu\.be\/([^"&?\/\s]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Get video metadata from YouTube API
   */
  async getVideoMetadata(videoId: string, apiKey?: string) {
    try {
      // Use either service account auth or API key
      const youtubeClient = apiKey ? 
        google.youtube({ version: 'v3', auth: apiKey }) : 
        this.youtube

      const response = await youtubeClient.videos.list({
        part: ['snippet', 'status', 'contentDetails'],
        id: [videoId]
      })

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found or not accessible')
      }

      const video = response.data.items[0]
      return {
        id: video.id,
        title: video.snippet?.title,
        description: video.snippet?.description,
        thumbnails: video.snippet?.thumbnails,
        duration: video.contentDetails?.duration,
        privacyStatus: video.status?.privacyStatus,
        uploadStatus: video.status?.uploadStatus,
        embeddable: video.status?.embeddable,
        publishedAt: video.snippet?.publishedAt
      }
    } catch (error) {
      console.error('Error getting video metadata:', error)
      throw new Error('Failed to access video. Video may be private or does not exist.')
    }
  }

  /**
   * Check if video is accessible for embedding
   */
  async validateVideoAccess(videoId: string): Promise<{
    accessible: boolean
    embeddable: boolean
    privacyStatus: string
    reason?: string
  }> {
    try {
      const metadata = await this.getVideoMetadata(videoId, process.env.YOUTUBE_API_KEY)
      
      const accessible = metadata.privacyStatus === 'public' || metadata.privacyStatus === 'unlisted'
      const embeddable = metadata.embeddable !== false
      
      let reason = ''
      if (!accessible) {
        reason = 'Video is private and cannot be embedded'
      } else if (!embeddable) {
        reason = 'Video embedding is disabled by the owner'
      }

      return {
        accessible,
        embeddable,
        privacyStatus: metadata.privacyStatus || 'unknown',
        reason
      }
    } catch (error) {
      return {
        accessible: false,
        embeddable: false,
        privacyStatus: 'error',
        reason: 'Failed to validate video access'
      }
    }
  }

  /**
   * Generate a secure, time-limited embed URL for authenticated users
   */
  generateSecureEmbedUrl(videoId: string, userId: string, userRole: string): string {
    try {
      const videoAccessSecret = process.env.VIDEO_ACCESS_SECRET || 'default-secret-change-this'
      
      // Create a JWT token with video access information
      const token = jwt.sign({
        videoId,
        userId,
        userRole,
        timestamp: Date.now(),
        exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours expiry
      }, videoAccessSecret)

      // Enhanced embed URL with security parameters
      const embedParams = new URLSearchParams({
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        fs: '1',
        cc_load_policy: '0',
        iv_load_policy: '3',
        disablekb: '1',
        playsinline: '1',
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        widget_referrer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      })

      return `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}&access_token=${token}`
    } catch (error) {
      console.error('Error generating secure embed URL:', error)
      throw error
    }
  }

  /**
   * Verify access token for video requests
   */
  verifyVideoAccess(token: string): {
    valid: boolean
    videoId?: string
    userId?: string
    userRole?: string
    reason?: string
  } {
    try {
      const videoAccessSecret = process.env.VIDEO_ACCESS_SECRET || 'default-secret-change-this'
      const decoded = jwt.verify(token, videoAccessSecret) as any

      // Check if token is still valid (additional check beyond JWT exp)
      const now = Date.now()
      const tokenAge = now - decoded.timestamp
      const maxAge = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

      if (tokenAge > maxAge) {
        return {
          valid: false,
          reason: 'Token expired'
        }
      }

      return {
        valid: true,
        videoId: decoded.videoId,
        userId: decoded.userId,
        userRole: decoded.userRole
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Invalid token'
      }
    }
  }

  /**
   * Get video thumbnail URLs with fallbacks
   */
  getVideoThumbnails(videoId: string): {
    default: string
    medium: string
    high: string
    standard: string
    maxres: string
  } {
    const baseUrl = 'https://img.youtube.com/vi'
    return {
      default: `${baseUrl}/${videoId}/default.jpg`,
      medium: `${baseUrl}/${videoId}/mqdefault.jpg`, 
      high: `${baseUrl}/${videoId}/hqdefault.jpg`,
      standard: `${baseUrl}/${videoId}/sddefault.jpg`,
      maxres: `${baseUrl}/${videoId}/maxresdefault.jpg`
    }
  }

  /**
   * Generate a secure API endpoint URL for video access
   */
  generateVideoApiUrl(videoId: string): string {
    return `/api/video/secure/${videoId}`
  }

  /**
   * Check domain restrictions for video embedding
   */
  validateDomain(referrer: string): boolean {
    const allowedDomains = (process.env.ALLOWED_DOMAINS || 'localhost:3000').split(',')
    
    try {
      const url = new URL(referrer)
      const domain = url.hostname + (url.port ? `:${url.port}` : '')
      return allowedDomains.includes(domain)
    } catch {
      return false
    }
  }

  /**
   * Log video access for analytics and security
   */
  async logVideoAccess(data: {
    videoId: string
    userId: string
    userRole: string
    action: 'view' | 'play' | 'pause' | 'complete'
    timestamp: Date
    userAgent?: string
    ip?: string
  }) {
    try {
      // This can be extended to write to your analytics database
      console.log('Video Access Log:', {
        ...data,
        loggedAt: new Date().toISOString()
      })
      
      // TODO: Implement actual logging to your preferred analytics service
      // Example: await AnalyticsService.logEvent('video_access', data)
    } catch (error) {
      console.error('Failed to log video access:', error)
    }
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService()
export default youtubeService
