import Moods from "../models/moods.js";
import userModel from "../models/userModel.js";

const getMoods = async (req, res) => {
  try {
    const situations = await Moods.find(); // no sort applied

    res.status(200).json({
      success: true,
      count: situations.length,
      data: situations,
    });
  } catch (error) {
    console.error("Error fetching situations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch situations",
    });
  }
};

const addMoodEntry = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const { date, time, mood, situations } = req.body;

    if (!date || !time || !mood || !situations) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMoodEntry = {
      date,
      time,
      mood,
      situations,
      createdAt: new Date(),
    };

    const user = await userModel.findById(userId);
    console.log("USER FOUND ===>", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧠 Ensure moodEntries array exists
    if (!Array.isArray(user.moodEntries)) {
      user.moodEntries = [];
    }

    user.moodEntries.push(newMoodEntry);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Mood entry saved successfully",
      data: newMoodEntry,
    });
  } catch (error) {
    console.error("Error saving mood entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save mood entry",
      error: error.message,
    });
  }
};

export { getMoods, addMoodEntry };
