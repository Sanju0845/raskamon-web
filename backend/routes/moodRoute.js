import express from "express";
import { getMoods, addMoodEntry } from "../controllers/moodController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.get("/get-all-moods", getMoods);
router.post("/submit-mood", authUser, addMoodEntry);
export default router;
