import mongoose from 'mongoose'

// Define the Achievement interface
export interface IAchievement extends mongoose.Document {
  userId: string // Reference to User._id
  
  // Achievement details
  achievementType: 'streak' | 'completion' | 'score' | 'time' | 'milestone' | 'special'
  title: string
  description: string
  icon: string // Icon name or emoji
  
  // Achievement criteria
  criteria: {
    type: 'consecutive_days' | 'content_completed' | 'unit_completed' | 'test_score' | 'study_time' | 'custom'
    value: number // Target value to achieve
    unit?: string // 'days', 'videos', 'hours', 'percent', etc.
  }
  
  // Progress tracking
  currentProgress: number
  isUnlocked: boolean
  unlockedAt?: Date
  
  // Reward system
  points: number // Points awarded for this achievement
  badge?: string // Special badge earned
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Define the UserAchievement interface for tracking user's achievements
export interface IUserAchievement extends mongoose.Document {
  userId: string
  achievementId: string
  isEarned: boolean
  earnedAt?: Date
  currentProgress: number
  targetProgress: number
  createdAt: Date
  updatedAt: Date
}

const achievementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  achievementType: {
    type: String,
    enum: ['streak', 'completion', 'score', 'time', 'milestone', 'special'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    maxlength: 50
  },
  criteria: {
    type: {
      type: String,
      enum: ['consecutive_days', 'content_completed', 'unit_completed', 'test_score', 'study_time', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      maxlength: 20
    }
  },
  currentProgress: {
    type: Number,
    min: 0,
    default: 0
  },
  isUnlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  points: {
    type: Number,
    min: 0,
    default: 10
  },
  badge: {
    type: String,
    maxlength: 50
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

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  achievementId: {
    type: String,
    required: true,
    index: true
  },
  isEarned: {
    type: Boolean,
    default: false,
    index: true
  },
  earnedAt: {
    type: Date,
    default: null
  },
  currentProgress: {
    type: Number,
    min: 0,
    default: 0
  },
  targetProgress: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes
achievementSchema.index({ userId: 1, achievementType: 1 })
achievementSchema.index({ userId: 1, isUnlocked: 1 })
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })
userAchievementSchema.index({ userId: 1, isEarned: 1 })

// Middleware
achievementSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Auto-unlock achievement if criteria is met
  if (this.criteria && this.currentProgress >= this.criteria.value && !this.isUnlocked) {
    this.isUnlocked = true
    this.unlockedAt = new Date()
  }
  
  next()
})

userAchievementSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Auto-earn achievement if target is reached
  if (this.currentProgress >= this.targetProgress && !this.isEarned) {
    this.isEarned = true
    this.earnedAt = new Date()
  }
  
  next()
})

// Static methods for predefined achievements
achievementSchema.statics.createDefaultAchievements = async function(userId: string) {
  const defaultAchievements = [
    {
      userId,
      achievementType: 'streak',
      title: '🔥 First Streak',
      description: 'Study for 3 consecutive days',
      icon: '🔥',
      criteria: { type: 'consecutive_days', value: 3, unit: 'days' },
      points: 50
    },
    {
      userId,
      achievementType: 'streak',
      title: '🏆 Study Champion',
      description: 'Study for 7 consecutive days',
      icon: '🏆',
      criteria: { type: 'consecutive_days', value: 7, unit: 'days' },
      points: 150
    },
    {
      userId,
      achievementType: 'completion',
      title: '📚 First Steps',
      description: 'Complete your first 5 lessons',
      icon: '📚',
      criteria: { type: 'content_completed', value: 5, unit: 'lessons' },
      points: 30
    },
    {
      userId,
      achievementType: 'completion',
      title: '🎯 Unit Master',
      description: 'Complete an entire unit',
      icon: '🎯',
      criteria: { type: 'unit_completed', value: 1, unit: 'units' },
      points: 200
    },
    {
      userId,
      achievementType: 'score',
      title: '⭐ High Scorer',
      description: 'Score 90% or above on a test',
      icon: '⭐',
      criteria: { type: 'test_score', value: 90, unit: 'percent' },
      points: 100
    },
    {
      userId,
      achievementType: 'time',
      title: '⏰ Marathon Learner',
      description: 'Study for 10 hours total',
      icon: '⏰',
      criteria: { type: 'study_time', value: 600, unit: 'minutes' },
      points: 120
    }
  ]
  
  return this.insertMany(defaultAchievements)
}

// Clear existing models
if (mongoose.models?.Achievement) {
  delete mongoose.models.Achievement
}
if (mongoose.models?.UserAchievement) {
  delete mongoose.models.UserAchievement
}

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema)
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema)
