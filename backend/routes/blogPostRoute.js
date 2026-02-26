import express from "express";
import {
  submitBlogPost,
  getApprovedBlogPosts,
  getFeaturedBlogPosts,
  getUserBlogPosts,
  getBlogPostById,
  getPendingBlogPosts,
  reviewBlogPost,
  likeBlogPost,
  addComment,
  getComments,
  hidePostById,
  deletePostById,
  getAdminApprovedBlogPosts,
} from "../controllers/blogPostController.js";
import authUser from "../middlewares/authUser.js";
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedBlogPosts);
router.get("/featured", getFeaturedBlogPosts);
router.get("/:id", getBlogPostById);

// User routes (require authentication)
router.post("/submit", authUser, submitBlogPost);

router.get("/user/posts", authUser, getUserBlogPosts);
router.post("/:id/like", authUser, likeBlogPost);
router.post("/:id/comments", authUser, addComment);
router.get("/:id/comments", getComments);

// Admin routes (require admin authentication)
router.get("/admin/pending", authAdmin, getPendingBlogPosts);
router.get("/admin/approved", getAdminApprovedBlogPosts);
router.put("/admin/:id/review", authAdmin, reviewBlogPost);
router.post("/admin/post/hide/:id", authAdmin, hidePostById);
router.delete("/admin/post/delete/:id", authAdmin, deletePostById);

export default router;
