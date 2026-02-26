import express from "express";
import {
  getUserAnalyticsData,
  getUserTestData,
  getUserTestCategoryData,
  getUserCycleTestData,
  getAssessmentByTitle,
  getUserCurrentMonthAssessmentData,
  monthlyMoodAnalytics,
  moodAnalytics,
} from "../controllers/userAnalyticsController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

// More specific routes first
router.get("/user-test-category/:userId", authUser, getUserTestCategoryData);
router.get("/test-results/:userId", authUser, getUserTestData);
router.get("/assessment", authUser, getAssessmentByTitle);
router.get(
  "/user/current-month/assessment/:userId",
  authUser,
  getUserCurrentMonthAssessmentData
);

router.get("/user-assessment-cycle/:userId", authUser, getUserCycleTestData); // generic last
router.get("/:userId", authUser, getUserAnalyticsData); // generic last
router.get("/weekly-mood/:id", authUser, monthlyMoodAnalytics); // generic last
router.get("/emotions-analytics/:userId", authUser, moodAnalytics); // generic last

export default router;
