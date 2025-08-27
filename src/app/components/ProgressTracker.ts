// Progress Tracking Utility
// Handles UserProgress, StudySession, and Achievement updates

export interface ProgressData {
  contentId: string
  progressPercentage: number
  timeSpent: number
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  videoWatchTime?: number
  videoCompletionPercentage?: number
  testScore?: number
  testAttempts?: number
  correctAnswers?: number
  totalQuestions?: number
  notes?: string
  isBookmarked?: boolean
  engagementScore?: number
  device?: 'mobile' | 'tablet' | 'desktop'
}

export interface SessionData {
  contentId: string
  activityType: 'video_watch' | 'pdf_read' | 'test_attempt' | 'practice_solve'
  sessionStart: Date
  sessionEnd?: Date
  duration: number
  videoProgress?: {
    startTime: number
    endTime: number
    totalDuration: number
    watchedSegments: Array<{ start: number; end: number }>
  }
  testSession?: {
    questionsAttempted: number
    correctAnswers: number
    timeSpentPerQuestion: Array<{
      questionId: string
      timeSpent: number
      isCorrect: boolean
    }>
    finalScore: number
  }
  engagementScore: number
  device: 'mobile' | 'tablet' | 'desktop'
}

export class ProgressTracker {
  private static instance: ProgressTracker
  private activeSessions: Map<string, { sessionId: string; startTime: Date }> = new Map()

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker()
    }
    return ProgressTracker.instance
  }

  // Start a new study session
  async startSession(sessionData: Omit<SessionData, 'sessionEnd' | 'duration'>): Promise<string> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        const data = await response.json()
        const sessionId = data.session._id
        
        // Store active session
        this.activeSessions.set(sessionData.contentId, {
          sessionId,
          startTime: sessionData.sessionStart
        })
        
        return sessionId
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
    return ''
  }

  // End an active session
  async endSession(contentId: string, sessionData?: Partial<SessionData>): Promise<void> {
    const activeSession = this.activeSessions.get(contentId)
    if (!activeSession) return

    try {
      const response = await fetch(`/api/sessions/${activeSession.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          endSession: true
        })
      })

      if (response.ok) {
        this.activeSessions.delete(contentId)
      }
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  // Update progress with comprehensive data
  async updateProgress(progressData: ProgressData): Promise<void> {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData)
      })

      if (response.ok) {
        // Check for achievement updates
        await this.checkAchievements(progressData)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  // Check and update achievements
  private async checkAchievements(progressData: ProgressData): Promise<void> {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: progressData.contentId,
          progressData
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.newAchievements?.length > 0) {
          // Could trigger achievement notifications here
          console.log('New achievements unlocked:', data.newAchievements)
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error)
    }
  }

  // Get device type
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  // Calculate engagement score based on activity patterns
  calculateEngagementScore(
    timeSpent: number,
    progressPercentage: number,
    activityType: string,
    interactions: number = 0
  ): number {
    let score = 5 // Base score

    // Time-based scoring
    if (timeSpent > 30) score += 2 // Bonus for longer sessions
    if (timeSpent > 60) score += 1 // Additional bonus for very long sessions

    // Progress-based scoring
    if (progressPercentage > 50) score += 1
    if (progressPercentage > 90) score += 1

    // Activity-based scoring
    if (activityType === 'video_watch') score += 1
    if (activityType === 'test_attempt') score += 2 // Tests are more engaging

    // Interaction-based scoring
    if (interactions > 5) score += 1

    return Math.min(score, 10) // Cap at 10
  }

  // Track video progress with segments
  async trackVideoProgress(
    contentId: string,
    currentTime: number,
    totalDuration: number,
    watchedSegments: Array<{ start: number; end: number }>
  ): Promise<void> {
    const progressPercentage = (currentTime / totalDuration) * 100
    const timeSpent = currentTime / 60 // Convert to minutes

    await this.updateProgress({
      contentId,
      progressPercentage,
      timeSpent,
      status: progressPercentage >= 100 ? 'completed' : 'in_progress',
      videoWatchTime: timeSpent,
      videoCompletionPercentage: progressPercentage
    })

    // Update active session if exists
    const activeSession = this.activeSessions.get(contentId)
    if (activeSession) {
      await fetch(`/api/sessions/${activeSession.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoProgress: {
            startTime: 0,
            endTime: currentTime,
            totalDuration,
            watchedSegments
          }
        })
      })
    }
  }

  // Track PDF reading progress
  async trackPDFProgress(
    contentId: string,
    timeSpent: number,
    estimatedProgress: number
  ): Promise<void> {
    await this.updateProgress({
      contentId,
      progressPercentage: estimatedProgress,
      timeSpent,
      status: estimatedProgress >= 100 ? 'completed' : 'in_progress'
    })
  }

  // Track test/practice results
  async trackTestResults(
    contentId: string,
    testData: {
      score: number
      correctAnswers: number
      totalQuestions: number
      timeSpent: number
      questionsData: Array<{
        questionId: string
        timeSpent: number
        isCorrect: boolean
      }>
    }
  ): Promise<void> {
    await this.updateProgress({
      contentId,
      progressPercentage: 100, // Tests are completed when submitted
      timeSpent: testData.timeSpent,
      status: 'completed',
      testScore: testData.score,
      testAttempts: 1, // Increment this if needed
      correctAnswers: testData.correctAnswers,
      totalQuestions: testData.totalQuestions
    })

    // End session with test data
    await this.endSession(contentId, {
      testSession: {
        questionsAttempted: testData.totalQuestions,
        correctAnswers: testData.correctAnswers,
        timeSpentPerQuestion: testData.questionsData,
        finalScore: testData.score
      }
    })
  }
}

export default ProgressTracker.getInstance()
