import express from "express";
import {
  createTestimonial,
  getApprovedTestimonials,
  getUserTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  updateTestimonialStatus,
} from "../controllers/testimonialController.js";
import authUser from "../middlewares/authUser.js";
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedTestimonials);

// User routes (require authentication)
router.post("/", authUser, createTestimonial);
router.get("/user/:userId", authUser, getUserTestimonial);
router.put("/:testimonialId", authUser, updateTestimonial);
router.delete("/:testimonialId", authUser, deleteTestimonial);

// Admin routes (require admin authentication)
router.get("/all", authAdmin, getAllTestimonials);
router.put("/:testimonialId/status", authAdmin, updateTestimonialStatus);

export default router;
