// Simplified Progress Tracking Utility
// Handles basic attempt tracking for content

export interface AttemptData {
  contentId: string
  status: 'not_attempted' | 'attempted'
  notes?: string
  isBookmarked?: boolean
}

export class ProgressTracker {
  private static instance: ProgressTracker

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker()
    }
    return ProgressTracker.instance
  }

  // Mark content as attempted
  async markAsAttempted(contentId: string, notes?: string): Promise<void> {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          status: 'attempted',
          notes
        })
      })

      if (response.ok) {
        console.log('Content marked as attempted successfully')
      }
    } catch (error) {
      console.error('Failed to mark content as attempted:', error)
    }
  }

  // Get attempt status for content
  async getAttemptStatus(contentId: string): Promise<'not_attempted' | 'attempted' | null> {
    try {
      const response = await fetch(`/api/progress?contentId=${contentId}`)
      if (response.ok) {
        const data = await response.json()
        return data.progress?.status || 'not_attempted'
      }
    } catch (error) {
      console.error('Failed to get attempt status:', error)
    }
    return null
  }

  // Toggle bookmark status
  async toggleBookmark(contentId: string, isBookmarked: boolean): Promise<void> {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          isBookmarked
        })
      })

      if (response.ok) {
        console.log('Bookmark status updated successfully')
      }
    } catch (error) {
      console.error('Failed to update bookmark status:', error)
    }
  }

  // Update notes for content
  async updateNotes(contentId: string, notes: string): Promise<void> {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          notes
        })
      })

      if (response.ok) {
        console.log('Notes updated successfully')
      }
    } catch (error) {
      console.error('Failed to update notes:', error)
    }
  }

  // Get device type (kept for potential future use)
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }
}

export default ProgressTracker.getInstance()
