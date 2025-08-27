import mongoose from 'mongoose'

// Define the UserProgress interface
export interface IUserProgress extends mongoose.Document {
  userId: string // Reference to User._id
  contentId: string // Reference to Content._id
  
  // Progress tracking
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  progressPercentage: number // 0-100
  timeSpent: number // in minutes
  lastAccessedAt: Date
  completedAt?: Date
  
  // Video-specific tracking
  videoWatchTime?: number // in minutes, for video content
  videoCompletionPercentage?: number // 0-100
  
  // Test/Practice-specific tracking
  testScore?: number // for MockTest and PracticeSet
  testAttempts?: number
  correctAnswers?: number
  totalQuestions?: number
  testCompletedAt?: Date
  
  // Learning path tracking
  sequencePosition: number // Position in the learning sequence
  isUnlocked: boolean // Whether this content is unlocked for the user
  
  // Notes and bookmarks
  notes?: string
  isBookmarked: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Define static methods interface
export interface IUserProgressModel extends mongoose.Model<IUserProgress> {
  getUserProgress(userId: string, options?: {
    status?: string
    isUnlocked?: boolean
    sort?: Record<string, number>
  }): Promise<IUserProgress[]>
  getProgressSummary(userId: string): Promise<Array<{
    _id: string
    count: number
    totalTimeSpent: number
    avgProgress: number
  }>>
  getUnitProgress(userId: string, unit: string): Promise<Array<{
    _id: string
    count: number
    totalTimeSpent: number
  }>>
}

const userProgressSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'skipped'],
    default: 'not_started',
    index: true
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Video-specific fields
  videoWatchTime: {
    type: Number,
    min: 0,
    default: 0
  },
  videoCompletionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Test-specific fields
  testScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  testAttempts: {
    type: Number,
    min: 0,
    default: 0
  },
  correctAnswers: {
    type: Number,
    min: 0,
    default: null
  },
  totalQuestions: {
    type: Number,
    min: 0,
    default: null
  },
  testCompletedAt: {
    type: Date,
    default: null
  },
  
  // Learning path
  sequencePosition: {
    type: Number,
    required: true,
    index: true
  },
  isUnlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // User annotations
  notes: {
    type: String,
    maxlength: 5000,
    default: ''
  },
  isBookmarked: {
    type: Boolean,
    default: false,
    index: true
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

// Compound indexes for efficient querying
userProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true })
userProgressSchema.index({ userId: 1, status: 1 })
userProgressSchema.index({ userId: 1, sequencePosition: 1 })
userProgressSchema.index({ userId: 1, lastAccessedAt: -1 })
userProgressSchema.index({ userId: 1, isBookmarked: 1 })
userProgressSchema.index({ userId: 1, isUnlocked: 1 })

// Update the updatedAt field before saving
userProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Auto-complete logic
  if (this.progressPercentage >= 100 && this.status !== 'completed') {
    this.status = 'completed'
    this.completedAt = new Date()
  }
  
  next()
})

// Static methods
userProgressSchema.statics.getUserProgress = function(userId: string, options: {
  status?: string
  isUnlocked?: boolean
  sort?: Record<string, number>
} = {}) {
  const query: Record<string, unknown> = { userId }
  if (options.status) query.status = options.status
  if (options.isUnlocked !== undefined) query.isUnlocked = options.isUnlocked
  
  return this.find(query).sort(options.sort || { sequencePosition: 1, lastAccessedAt: -1 })
}

userProgressSchema.statics.getProgressSummary = async function(userId: string) {
  const pipeline = [
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTimeSpent: { $sum: '$timeSpent' },
        avgProgress: { $avg: '$progressPercentage' }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

userProgressSchema.statics.getUnitProgress = async function(userId: string, unit: string) {
  const pipeline = [
    {
      $lookup: {
        from: 'contents',
        localField: 'contentId',
        foreignField: '_id',
        as: 'content'
      }
    },
    {
      $match: {
        userId,
        'content.unit': unit
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

// Clear any existing model to ensure schema updates are applied
if (mongoose.models?.UserProgress) {
  delete mongoose.models.UserProgress
}

export const UserProgress = mongoose.model<IUserProgress, IUserProgressModel>('UserProgress', userProgressSchema)
