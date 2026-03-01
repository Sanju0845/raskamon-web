import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  isApproved: {
    type: Boolean,
    default: true, // Reviews visible immediately
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
reviewSchema.index({ doctorId: 1, isApproved: 1 });
reviewSchema.index({ userId: 1, doctorId: 1 });

export default mongoose.model('Review', reviewSchema);
