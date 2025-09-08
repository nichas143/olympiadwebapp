'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Content {
  _id: string
  unit: 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics' | 'Functional Equations' | 'Inequalities' | 'Advanced Math' | 'Calculus' | 'Other'
  chapter: string
  topic: string
  concept: string
  contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
  instructionType: 'problemDiscussion' | 'conceptDiscussion'
  level: string
  duration: number
  videoLink?: string | null
  description: string
  sequenceNo: number
  docCategory: 'Learning' | 'MockTest' | 'PracticeSet'
  noOfProblems?: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  videoAccessLevel?: string
  requiresSubscription?: boolean
  isPublicAccess?: boolean
}

interface PublicContentOptions {
  level?: string
  contentType?: string
  sortBy?: 'sequence' | 'newest' | 'alphabetical'
  limit?: number
}

interface PublicContentResult {
  content: Content[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// In-memory cache for client-side
const publicContentCache = new Map<string, { data: Content[], timestamp: number, ttl: number }>()

export function usePublicContent(options: PublicContentOptions = {}): PublicContentResult {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Create cache key based on options
  const createCacheKey = useCallback((opts: PublicContentOptions) => {
    const params = new URLSearchParams()
    Object.entries(opts).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })
    return `public-content-${params.toString()}`
  }, [])

  // Fetch content with caching
  const fetchContent = useCallback(async (opts: PublicContentOptions) => {
    const cacheKey = createCacheKey(opts)
    const now = Date.now()
    
    // Check client-side cache first
    const cached = publicContentCache.get(cacheKey)
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
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Build API parameters
      const params = new URLSearchParams()
      Object.entries(opts).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })
      params.append('sortBy', opts.sortBy || 'sequence')
      params.append('limit', (opts.limit || 50).toString())

      // Fetch content from public API
      const response = await fetch(`/api/content/public?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch public content')
      }

      const data = await response.json()
      console.log('Public content data:', data) // Debug log

      // Update state
      setContent(data.content || [])
      setLastUpdated(new Date())

      // Cache the result
      publicContentCache.set(cacheKey, {
        data: data.content || [],
        timestamp: now,
        ttl: 10 * 60 * 1000 // 10 minutes TTL for public content
      })

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }
      console.error('Error fetching public content:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch public content')
    } finally {
      setLoading(false)
    }
  }, [createCacheKey])

  // Initial fetch and refetch when options change
  useEffect(() => {
    fetchContent(options)
  }, [fetchContent, JSON.stringify(options)])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    content,
    loading,
    error,
    lastUpdated
  }
}
