import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Patient",
  },
  quote: {
    type: String,
    required: true,
    maxlength: 500,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
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

// Update the updatedAt field before saving
testimonialSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add comprehensive indexes for better query performance
testimonialSchema.index({ userId: 1 }); // For user's testimonials
testimonialSchema.index({ isApproved: 1 }); // For approved testimonials
testimonialSchema.index({ isAnonymous: 1 }); // For anonymous testimonials
testimonialSchema.index({ rating: -1 }); // For sorting by rating (highest first)
testimonialSchema.index({ createdAt: -1 }); // For sorting by creation date
testimonialSchema.index({ updatedAt: -1 }); // For sorting by update date
testimonialSchema.index({ role: 1 }); // For role-based queries
testimonialSchema.index({ author: 1 }); // For author-based queries

// Compound indexes for common query patterns
testimonialSchema.index({ isApproved: 1, rating: -1 }); // For approved testimonials sorted by rating
testimonialSchema.index({ isApproved: 1, createdAt: -1 }); // For approved testimonials sorted by date
testimonialSchema.index({ isApproved: 1, isAnonymous: 1 }); // For approved testimonials with anonymity
testimonialSchema.index({ userId: 1, isApproved: 1 }); // For user's approved testimonials
testimonialSchema.index({ userId: 1, createdAt: -1 }); // For user's testimonials sorted by date
testimonialSchema.index({ rating: -1, createdAt: -1 }); // For high-rated testimonials sorted by date
testimonialSchema.index({ role: 1, isApproved: 1 }); // For approved testimonials by role
testimonialSchema.index({ isApproved: 1, role: 1, rating: -1 }); // For approved testimonials by role and rating
testimonialSchema.index({ isAnonymous: 1, isApproved: 1 }); // For anonymous approved testimonials
testimonialSchema.index({ rating: -1, isApproved: 1, createdAt: -1 }); // For top-rated approved testimonials

// Text index for search functionality
testimonialSchema.index({
  quote: "text",
  author: "text",
  role: "text",
});

const testimonialModel =
  mongoose.models.testimonial ||
  mongoose.model("testimonial", testimonialSchema);

export default testimonialModel;
