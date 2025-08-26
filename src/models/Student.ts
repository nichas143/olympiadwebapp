import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  currentClass: {
    type: String,
    required: [true, 'Current class is required'],
    enum: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    trim: true
  },
  schoolName: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [200, 'School name cannot be more than 200 characters']
  },
  prerequisites: {
    basicMathematics: {
      type: Boolean,
      default: false
    },
    algebra: {
      type: Boolean,
      default: false
    },
    geometry: {
      type: Boolean,
      default: false
    },
    numberTheory: {
      type: Boolean,
      default: false
    },
    combinatorics: {
      type: Boolean,
      default: false
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
