import express from "express";
import {
  addMoodEntry,
  getMoodEntries,
  deleteMoodEntries,
  deleteAllMoodData,
  getMoodAnalytics,
  updateMoodTrackingPreferences,
  getMoodTrackingPreferences,
  getAIAnalysis,
  getLatestAIAnalysis,
  createMoodGoal,
  getMoodGoals,
  getMoodDashboard,
  getMoodPatterns,
  getMoodInsights,
} from "../controllers/moodTrackingController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

// All routes require user authentication
router.use(authUser);

// Mood entry routes
router.post("/users/:userId/mood-entries", addMoodEntry);
router.get("/users/:userId/mood-entries", getMoodEntries);
router.delete("/users/:userId/mood-entries", deleteMoodEntries);
router.delete("/users/:userId/mood-data", deleteAllMoodData);

// Analytics routes
router.get("/users/:userId/mood-analytics", getMoodAnalytics);
router.get("/users/:userId/ai-analysis", getAIAnalysis);
router.get("/users/:userId/latest-ai-analysis", getLatestAIAnalysis);

// Dashboard routes
router.get("/users/:userId/mood-dashboard", getMoodDashboard);
router.get("/users/:userId/mood-patterns", getMoodPatterns);
router.get("/users/:userId/mood-insights", getMoodInsights);

// Preferences routes
router.get("/users/:userId/mood-preferences", getMoodTrackingPreferences);
router.put("/users/:userId/mood-preferences", updateMoodTrackingPreferences);

// Goal routes
router.post("/users/:userId/mood-goals", createMoodGoal);
router.get("/users/:userId/mood-goals", getMoodGoals);

export default router;
