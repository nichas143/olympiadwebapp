import mongoose from 'mongoose'

// Define the StudySession interface
export interface IStudySession extends mongoose.Document {
  userId: string // Reference to User._id
  contentId: string // Reference to Content._id
  
  // Session details
  sessionStart: Date
  sessionEnd?: Date
  duration: number // in minutes, calculated on session end
  isActive: boolean // Whether session is currently active
  
  // Activity tracking
  activityType: 'video_watch' | 'pdf_read' | 'test_attempt' | 'practice_solve'
  videoProgress?: {
    startTime: number // in seconds
    endTime: number // in seconds
    totalDuration: number // in seconds
    watchedSegments: Array<{
      start: number
      end: number
    }>
  }
  
  // Test/Practice session data
  testSession?: {
    questionsAttempted: number
    correctAnswers: number
    timeSpentPerQuestion: Array<{
      questionId: string
      timeSpent: number // in seconds
      isCorrect: boolean
    }>
    finalScore: number
  }
  
  // Learning effectiveness
  engagementScore: number // 1-10 based on activity patterns
  device: string // 'mobile' | 'tablet' | 'desktop'
  location?: string // IP-based location (optional)
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Define static methods interface
export interface IStudySessionModel extends mongoose.Model<IStudySession> {
  endSession(sessionId: string): Promise<IStudySession | null>
  getUserSessions(userId: string, options?: { 
    activityType?: string
    isActive?: boolean
    sort?: Record<string, number>
    limit?: number
  }): Promise<IStudySession[]>
  getStudyTimeAnalytics(userId: string, days?: number): Promise<Array<{
    _id: { year: number; month: number; day: number }
    totalDuration: number
    sessionCount: number
    avgEngagement: number
  }>>
}

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  contentId: {
    type: String,
    required: true,
    index: true
  },
  sessionStart: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  sessionEnd: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['video_watch', 'pdf_read', 'test_attempt', 'practice_solve'],
    required: true,
    index: true
  },
  
  // Video-specific tracking
  videoProgress: {
    startTime: {
      type: Number,
      min: 0,
      default: 0
    },
    endTime: {
      type: Number,
      min: 0,
      default: 0
    },
    totalDuration: {
      type: Number,
      min: 0,
      default: 0
    },
    watchedSegments: [{
      start: { type: Number, min: 0 },
      end: { type: Number, min: 0 }
    }]
  },
  
  // Test session tracking
  testSession: {
    questionsAttempted: {
      type: Number,
      min: 0,
      default: 0
    },
    correctAnswers: {
      type: Number,
      min: 0,
      default: 0
    },
    timeSpentPerQuestion: [{
      questionId: { type: String, required: true },
      timeSpent: { type: Number, min: 0 },
      isCorrect: { type: Boolean, default: false }
    }],
    finalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  engagementScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },
  location: {
    type: String,
    maxlength: 100,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Compound indexes
studySessionSchema.index({ userId: 1, sessionStart: -1 })
studySessionSchema.index({ userId: 1, activityType: 1 })
studySessionSchema.index({ userId: 1, isActive: 1 })
studySessionSchema.index({ contentId: 1, sessionStart: -1 })

// Update the updatedAt field before saving
studySessionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate duration if session is ending
  if (this.sessionEnd && this.sessionStart) {
    this.duration = Math.round((this.sessionEnd.getTime() - this.sessionStart.getTime()) / (1000 * 60))
    this.isActive = false
  }
  
  next()
})

// Static methods
studySessionSchema.statics.endSession = function(sessionId: string) {
  return this.findByIdAndUpdate(
    sessionId,
    {
      sessionEnd: new Date(),
      isActive: false
    },
    { new: true }
  )
}

studySessionSchema.statics.getUserSessions = function(userId: string, options: { 
  activityType?: string
  isActive?: boolean
  sort?: Record<string, number>
  limit?: number
} = {}) {
  const query: Record<string, unknown> = { userId }
  if (options.activityType) query.activityType = options.activityType
  if (options.isActive !== undefined) query.isActive = options.isActive
  
  return this.find(query)
    .sort(options.sort || { sessionStart: -1 })
    .limit(options.limit || 100)
}

studySessionSchema.statics.getStudyTimeAnalytics = async function(userId: string, days: number = 30) {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)
  
  const pipeline = [
    {
      $match: {
        userId,
        sessionStart: { $gte: dateThreshold },
        isActive: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$sessionStart' },
          month: { $month: '$sessionStart' },
          day: { $dayOfMonth: '$sessionStart' }
        },
        totalDuration: { $sum: '$duration' },
        sessionCount: { $sum: 1 },
        avgEngagement: { $avg: '$engagementScore' }
      }
    },
          {
        $sort: { '_id.year': 1 as const, '_id.month': 1 as const, '_id.day': 1 as const }
      }
  ]
  
  return this.aggregate(pipeline)
}

// Clear any existing model
if (mongoose.models?.StudySession) {
  delete mongoose.models.StudySession
}

export const StudySession = mongoose.model<IStudySession, IStudySessionModel>('StudySession', studySessionSchema)
