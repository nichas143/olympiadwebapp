import mongoose from 'mongoose'

// Define the Content interface
export interface IContent extends mongoose.Document {
  unit: 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics' | 'Functional Equations' | 'Inequalities' | 'Advanced Math' | 'Calculus' | 'Other'
  chapter: string
  topic: string
  concept: string
  contentType: 'pdf' | 'video' | 'link' | 'testpaperLink'
  instructionType: 'problemDiscussion' | 'conceptDiscussion'
  duration: number // in minutes
  videoLink?: string | null
  description: string
  sequenceNo: number // Natural number for learning sequence
  docCategory: 'Learning' | 'MockTest' | 'PracticeSet'
  noOfProblems?: number // Required for MockTest and PracticeSet
  createdAt: Date
  updatedAt: Date
  createdBy?: string // Reference to the admin who created it
  isActive: boolean // For enabling/disabling content
}

const contentSchema = new mongoose.Schema({
  unit: {
    type: String,
    enum: ['Algebra', 'Geometry', 'Number Theory', 'Combinatorics', 'Functional Equations', 'Inequalities', 'Advanced Math', 'Calculus', 'Other'],
    required: true,
    index: true
  },
  chapter: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  concept: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  contentType: {
    type: String,
    enum: ['pdf', 'video', 'link', 'testpaperLink'],
    required: true,
    index: true
  },
  instructionType: {
    type: String,
    enum: ['problemDiscussion', 'conceptDiscussion'],
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 1440 // Maximum 24 hours
  },
  videoLink: {
    type: String,
    default: null,
    validate: {
      validator: function(this: IContent, value: string | null) {
        // If docCategory is Learning, videoLink should be provided
        if (this.docCategory === 'Learning' && !value) {
          return false
        }
        // If videoLink is provided, validate URL format
        if (value) {
          // More comprehensive URL validation that handles Google Drive, YouTube, etc.
          const urlRegex = /^https?:\/\/(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
          return urlRegex.test(value)
        }
        return true
      },
      message: 'Valid link is required for Learning category content'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  sequenceNo: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  docCategory: {
    type: String,
    enum: ['Learning', 'MockTest', 'PracticeSet'],
    required: true,
    index: true
  },
  noOfProblems: {
    type: Number,
    min: 1,
    max: 500,
    validate: {
      validator: function(this: IContent, value: number | undefined) {
        // noOfProblems is required for MockTest and PracticeSet
        if ((this.docCategory === 'MockTest' || this.docCategory === 'PracticeSet') && !value) {
          return false
        }
        // noOfProblems should not be set for Learning category
        if (this.docCategory === 'Learning' && value) {
          return false
        }
        return true
      },
      message: 'Number of problems is required for MockTest and PracticeSet, and should not be set for Learning'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
})

// Compound indexes for efficient querying
contentSchema.index({ unit: 1, contentType: 1 })
contentSchema.index({ unit: 1, instructionType: 1 })
contentSchema.index({ unit: 1, docCategory: 1 })
contentSchema.index({ chapter: 1, topic: 1 })
contentSchema.index({ isActive: 1, createdAt: -1 })
contentSchema.index({ unit: 1, chapter: 1, sequenceNo: 1 })
contentSchema.index({ docCategory: 1, sequenceNo: 1 })

// Update the updatedAt field before saving
contentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for formatted duration
contentSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60)
  const minutes = this.duration % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
})

// Virtual for YouTube video ID extraction
contentSchema.virtual('youtubeVideoId').get(function() {
  if (!this.videoLink) return null
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = this.videoLink.match(regex)
  return match ? match[1] : null
})

// Static method to get content by unit
contentSchema.statics.getByUnit = function(unit: string, options: {
  sort?: Record<string, number>
} = {}) {
  const query = { unit, isActive: true }
  return this.find(query).sort(options.sort || { sequenceNo: 1, chapter: 1, topic: 1 })
}

// Static method to get content by type
contentSchema.statics.getByContentType = function(contentType: string, options: {
  sort?: Record<string, number>
} = {}) {
  const query = { contentType, isActive: true }
  return this.find(query).sort(options.sort || { sequenceNo: 1, unit: 1, chapter: 1 })
}

// Static method to get content by document category
contentSchema.statics.getByDocCategory = function(docCategory: string, options: {
  sort?: Record<string, number>
} = {}) {
  const query = { docCategory, isActive: true }
  return this.find(query).sort(options.sort || { sequenceNo: 1, unit: 1, chapter: 1 })
}

// Static method to get content in sequence order
contentSchema.statics.getInSequence = function(unit?: string) {
  const query: Record<string, unknown> = { isActive: true }
  if (unit) query.unit = unit
  return this.find(query).sort({ sequenceNo: 1, unit: 1, chapter: 1, topic: 1 })
}

// Clear any existing model to ensure schema updates are applied
if (mongoose.models?.Content) {
  delete mongoose.models.Content
}

export const Content = mongoose.model<IContent>('Content', contentSchema)
