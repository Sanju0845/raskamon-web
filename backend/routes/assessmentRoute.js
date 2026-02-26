import express from "express";
import {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getUserAssessments,
  getAssessmentDetails,
  getUserProgress,
} from "../controllers/assessmentController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

// Public routes
router.get("/", getAssessments);
router.get("/:id", getAssessmentById);

// Protected routes (require user authentication)
router.post("/submit", authUser, submitAssessment);
router.get("/user/:userId", getUserAssessments);
router.get("/api/assessments/results/:id", authUser, getAssessmentDetails);
router.get("/progress/:userId", authUser, getUserProgress);

export default router;
