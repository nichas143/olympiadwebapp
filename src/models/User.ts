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
