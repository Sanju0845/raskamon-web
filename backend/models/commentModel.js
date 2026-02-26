import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  blogPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogPost",
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
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
commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add comprehensive indexes for better query performance
commentSchema.index({ blogPostId: 1, createdAt: -1 }); // For blog post comments sorted by date
commentSchema.index({ authorId: 1, createdAt: -1 }); // For user's comments sorted by date
commentSchema.index({ blogPostId: 1 }); // For all comments on a specific blog post
commentSchema.index({ authorId: 1 }); // For all comments by a specific user
commentSchema.index({ createdAt: -1 }); // For sorting all comments by date
commentSchema.index({ updatedAt: -1 }); // For sorting by update date
commentSchema.index({ isAnonymous: 1 }); // For filtering anonymous comments

// Compound indexes for common query patterns
commentSchema.index({ blogPostId: 1, isAnonymous: 1 }); // For blog post comments with anonymity filter
commentSchema.index({ authorId: 1, isAnonymous: 1 }); // For user's comments with anonymity filter
commentSchema.index({ blogPostId: 1, authorId: 1 }); // For specific user's comments on specific post

// Text index for search functionality
commentSchema.index({
  content: "text",
  author: "text",
});

const commentModel =
  mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;
