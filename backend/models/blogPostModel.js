import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  excerpt: {
    type: String,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "mental-health",
      "wellness",
      "relationships",
      "parenting",
      "stress-management",
      "self-care",
      "therapy",
      "personal-story",
    ],
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  imageUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  adminNotes: {
    type: String,
    maxlength: 500,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  is_hidden: { type: Boolean, default: false },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp and generate excerpt
blogPostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    // Strip HTML tags for excerpt
    const plainText = this.content.replace(/<[^>]*>/g, "");
    this.excerpt =
      plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;
  }

  next();
});

// Add comprehensive indexes for better query performance
blogPostSchema.index({ status: 1, category: 1 }); // For filtering by status and category
blogPostSchema.index({ authorId: 1, status: 1 }); // For author's posts by status
blogPostSchema.index({ submittedAt: -1 }); // For sorting by submission date
// Note: slug already has unique index from schema definition
blogPostSchema.index({ publishedAt: -1 }); // For sorting published posts by date
blogPostSchema.index({ updatedAt: -1 }); // For sorting by update date
blogPostSchema.index({ isFeatured: 1 }); // For featured posts
blogPostSchema.index({ isAnonymous: 1 }); // For anonymous posts
blogPostSchema.index({ likes: -1 }); // For sorting by likes
blogPostSchema.index({ views: -1 }); // For sorting by views
blogPostSchema.index({ comments: -1 }); // For sorting by comments
blogPostSchema.index({ category: 1 }); // For category-based queries
blogPostSchema.index({ status: 1 }); // For status-based queries
blogPostSchema.index({ author: 1 }); // For author-based queries

// Compound indexes for common query patterns
blogPostSchema.index({ status: 1, publishedAt: -1 }); // For approved posts sorted by publish date
blogPostSchema.index({ status: 1, isFeatured: 1 }); // For featured approved posts
blogPostSchema.index({ category: 1, status: 1, publishedAt: -1 }); // For category posts sorted by date
blogPostSchema.index({ authorId: 1, submittedAt: -1 }); // For author's posts sorted by submission
blogPostSchema.index({ status: 1, submittedAt: -1 }); // For pending posts sorted by submission
blogPostSchema.index({ isFeatured: 1, publishedAt: -1 }); // For featured posts sorted by date
blogPostSchema.index({ category: 1, isFeatured: 1 }); // For featured posts by category

// Text index for search functionality
blogPostSchema.index({
  title: "text",
  content: "text",
  excerpt: "text",
  tags: "text",
});

const blogPostModel =
  mongoose.models.blogPost || mongoose.model("blogPost", blogPostSchema);

export default blogPostModel;
