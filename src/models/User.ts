import mongoose from 'mongoose'

// Define the User interface
export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  role: 'student' | 'admin' | 'superadmin'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  approvedBy?: string
  // Subscription fields
  subscriptionStatus: 'none' | 'trial' | 'pending' | 'active' | 'expired' | 'cancelled'
  subscriptionPlan?: 'annual' | 'student_annual'
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  trialStartDate?: Date
  trialEndDate?: Date
  razorpayCustomerId?: string
  razorpaySubscriptionId?: string
  lastPaymentDate?: Date
  nextBillingDate?: Date
  subscriptionAmount?: number
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  approvedBy: {
    type: String,
    default: null,
  },
  // Subscription fields
  subscriptionStatus: {
    type: String,
    enum: ['none', 'trial', 'pending', 'active', 'expired', 'cancelled'],
    default: 'none',
  },
  subscriptionPlan: {
    type: String,
    enum: ['annual', 'student_annual'],
    default: null,
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  trialStartDate: {
    type: Date,
    default: null,
  },
  trialEndDate: {
    type: Date,
    default: null,
  },
  razorpayCustomerId: {
    type: String,
    default: null,
  },
  razorpaySubscriptionId: {
    type: String,
    default: null,
  },
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  nextBillingDate: {
    type: Date,
    default: null,
  },
  subscriptionAmount: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema)
