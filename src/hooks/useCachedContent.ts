import { useState, useEffect, useCallback, useRef } from 'react'

interface Content {
  _id: string
  unit: 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics' | 'Functional Equations' | 'Inequalities' | 'Advanced Math' | 'Calculus' | 'Other'
  chapter: string
  topic: string
  concept: string
  contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
  instructionType: 'problemDiscussion' | 'conceptDiscussion'
  duration: number
  videoLink?: string | null
  description: string
  sequenceNo: number
  docCategory: 'Learning' | 'MockTest' | 'PracticeSet'
  noOfProblems?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  isActive: boolean
}

interface ContentWithAttempt extends Content {
  attemptStatus?: 'not_attempted' | 'attempted'
}

interface CachedContentOptions {
  unit?: string
  contentType?: string
  instructionType?: string
  docCategory?: string
  sortBy?: string
  page?: number
  limit?: number
}

interface CachedContentResult {
  content: ContentWithAttempt[]
  loading: boolean
  error: string | null
  refetch: () => void
  lastUpdated: Date | null
}

// In-memory cache for client-side
const contentCache = new Map<string, { data: ContentWithAttempt[], timestamp: number, ttl: number }>()

export function useCachedContent(options: CachedContentOptions = {}): CachedContentResult {
  const [content, setContent] = useState<ContentWithAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Create cache key based on options
  const createCacheKey = useCallback((opts: CachedContentOptions) => {
    const params = new URLSearchParams()
    Object.entries(opts).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value)
      }
    })
    return `content-${params.toString()}`
  }, [])

  // Fetch content with caching
  const fetchContent = useCallback(async (opts: CachedContentOptions = {}) => {
    const cacheKey = createCacheKey(opts)
    const now = Date.now()
    
    // Check client-side cache first
    const cached = contentCache.get(cacheKey)
    if (cached && (now - cached.timestamp) < cached.ttl) {
      setContent(cached.data)
      setLoading(false)
      setError(null)
      setLastUpdated(new Date(cached.timestamp))
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Build API parameters
      const params = new URLSearchParams()
      Object.entries(opts).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value)
        }
      })
      params.append('sortBy', opts.sortBy || 'sequence')
      params.append('limit', (opts.limit || 50).toString())

      // Fetch content from cached API
      const contentResponse = await fetch(`/api/content/cached?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
        }
      })

      if (!contentResponse.ok) {
        throw new Error('Failed to fetch content')
      }

      const contentData = await contentResponse.json()

      // Fetch progress data for all content items
      const contentIds = contentData.content.map((item: Content) => item._id).join(',')
      const progressResponse = await fetch(`/api/progress/cached?contentIds=${contentIds}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'max-age=60', // 1 minute
        }
      })

      let progressData: Record<string, { status: string; completedAt: string | null }> = {}
      if (progressResponse.ok) {
        const progressResult = await progressResponse.json()
        progressData = progressResult.progress || {}
      }

      // Combine content with progress data
      const contentWithAttempts = contentData.content.map((item: Content) => ({
        ...item,
        attemptStatus: (progressData[item._id]?.status || 'not_attempted') as 'not_attempted' | 'attempted'
      }))

      // Update state
      setContent(contentWithAttempts)
      setLastUpdated(new Date())

      // Cache the result
      contentCache.set(cacheKey, {
        data: contentWithAttempts,
        timestamp: now,
        ttl: 5 * 60 * 1000 // 5 minutes TTL
      })

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }
      console.error('Error fetching cached content:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }, [createCacheKey])

  // Initial fetch
  useEffect(() => {
    fetchContent(options)
  }, [fetchContent, JSON.stringify(options)])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Refetch function
  const refetch = useCallback(() => {
    const cacheKey = createCacheKey(options)
    contentCache.delete(cacheKey) // Clear cache
    fetchContent(options)
  }, [fetchContent, options, createCacheKey])

  return {
    content,
    loading,
    error,
    refetch,
    lastUpdated
  }
}
