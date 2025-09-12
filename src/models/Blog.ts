import mongoose from 'mongoose'

// Define the Blog interface
export interface IBlog extends mongoose.Document {
  title: string
  slug: string // URL-friendly version of title
  content: string // Markdown content with LaTeX support
  excerpt: string // Short description for previews
  author: string // Author name
  authorId: string // Reference to the admin who created it
  tags: string[] // Array of tags for categorization
  category: 'Mathematics' | 'Olympiad' | 'Problem Solving' | 'Study Tips' | 'Announcements' | 'General'
  status: 'draft' | 'published' | 'archived'
  featuredImage?: string // URL to featured image
  readTime: number // Estimated reading time in minutes
  views: number // Number of views
  isPublic: boolean // Whether blog is visible to all visitors
  publishedAt?: Date // When the blog was published
  createdAt: Date
  updatedAt: Date
  seoTitle?: string // Custom SEO title
  seoDescription?: string // Custom SEO description
  metaKeywords?: string[] // SEO keywords
}

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(slug: string) {
        // Allow only alphanumeric characters, hyphens, and underscores
        return /^[a-z0-9-_]+$/.test(slug)
      },
      message: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'
    }
  },
  content: {
    type: String,
    required: true,
    minlength: 1 // Allow any content length, validation will be handled in API
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  authorId: {
    type: String,
    required: true,
    index: true
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10 // Maximum 10 tags
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  category: {
    type: String,
    enum: ['Mathematics', 'Olympiad', 'Problem Solving', 'Study Tips', 'Announcements', 'General'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  featuredImage: {
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true // Optional field
        const urlRegex = /^https?:\/\/(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
        return urlRegex.test(url)
      },
      message: 'Invalid URL format for featured image'
    }
  },
  readTime: {
    type: Number,
    required: true,
    min: 1,
    max: 120 // Maximum 2 hours
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  publishedAt: {
    type: Date,
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
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 60
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 160
  },
  metaKeywords: {
    type: [String],
    default: [],
    validate: {
      validator: function(keywords: string[]) {
        return keywords.length <= 15 // Maximum 15 keywords
      },
      message: 'Maximum 15 meta keywords allowed'
    }
  }
})

// Compound indexes for efficient querying
blogSchema.index({ status: 1, isPublic: 1, publishedAt: -1 })
blogSchema.index({ category: 1, status: 1, publishedAt: -1 })
blogSchema.index({ tags: 1, status: 1, publishedAt: -1 })
blogSchema.index({ authorId: 1, status: 1, createdAt: -1 })
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' }) // Text search index

// Update the updatedAt field before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

// Virtual for formatted read time
blogSchema.virtual('formattedReadTime').get(function() {
  if (this.readTime < 60) {
    return `${this.readTime} min read`
  }
  const hours = Math.floor(this.readTime / 60)
  const minutes = this.readTime % 60
  return minutes > 0 ? `${hours}h ${minutes}m read` : `${hours}h read`
})

// Static method to get published blogs
blogSchema.statics.getPublished = function(options: {
  category?: string
  tag?: string
  authorId?: string
  limit?: number
  skip?: number
  sort?: Record<string, number>
} = {}) {
  const query: Record<string, unknown> = { 
    status: 'published', 
    isPublic: true 
  }
  
  if (options.category) query.category = options.category
  if (options.tag) query.tags = { $in: [options.tag] }
  if (options.authorId) query.authorId = options.authorId
  
  return this.find(query)
    .sort(options.sort || { publishedAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0)
}

// Static method to search blogs
blogSchema.statics.search = function(searchTerm: string, options: {
  category?: string
  limit?: number
  skip?: number
} = {}) {
  const query: Record<string, unknown> = {
    status: 'published',
    isPublic: true,
    $text: { $search: searchTerm }
  }
  
  if (options.category) query.category = options.category
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0)
}

// Static method to get related blogs
blogSchema.statics.getRelated = function(blogId: string, category: string, tags: string[], limit: number = 3) {
  return this.find({
    _id: { $ne: blogId },
    status: 'published',
    isPublic: true,
    $or: [
      { category: category },
      { tags: { $in: tags } }
    ]
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
}

// Static method to get blog statistics
blogSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        avgReadTime: { $avg: '$readTime' }
      }
    }
  ])
}

// Clear any existing model to ensure schema updates are applied
if (mongoose.models?.Blog) {
  delete mongoose.models.Blog
}

export const Blog = mongoose.model<IBlog>('Blog', blogSchema)
