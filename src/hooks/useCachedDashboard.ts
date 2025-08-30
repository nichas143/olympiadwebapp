import { useState, useEffect, useCallback, useRef } from 'react'

interface ProgressSummary {
  summary: Array<{
    _id: string
    count: number
  }>
  totalContent: number
  attemptedContent: number
  attemptRate: number
}

interface CachedDashboardResult {
  progressData: ProgressSummary | null
  loading: boolean
  error: string | null
  refetch: () => void
  lastUpdated: Date | null
}

// In-memory cache for dashboard data
const dashboardCache = new Map<string, { data: ProgressSummary, timestamp: number, ttl: number }>()

export function useCachedDashboard(): CachedDashboardResult {
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch dashboard data with caching
  const fetchDashboardData = useCallback(async () => {
    const cacheKey = 'dashboard-progress-summary'
    const now = Date.now()
    
    // Check client-side cache first
    const cached = dashboardCache.get(cacheKey)
    if (cached && (now - cached.timestamp) < cached.ttl) {
      setProgressData(cached.data)
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

      // Clean up any stale pending payments first
      try {
        await fetch('/api/payment/cleanup-pending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal
        })
      } catch (error) {
        console.error('Failed to cleanup pending payments:', error)
      }

      // Fetch progress summary from cached API
      const response = await fetch('/api/progress/cached?summary=true', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      console.log('Dashboard progress data:', data) // Debug log

      // Update state
      setProgressData(data)
      setLastUpdated(new Date())

      // Cache the result
      dashboardCache.set(cacheKey, {
        data,
        timestamp: now,
        ttl: 10 * 60 * 1000 // 10 minutes TTL for dashboard data
      })

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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
    const cacheKey = 'dashboard-progress-summary'
    dashboardCache.delete(cacheKey) // Clear cache
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    progressData,
    loading,
    error,
    refetch,
    lastUpdated
  }
}
