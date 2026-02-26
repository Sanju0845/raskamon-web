// backend/scripts/fixMoodEntries.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "./models/userModel.js";

dotenv.config();

const fixMoodEntries = async () => {
  try {
    console.log("🟢 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Ensure all users have a moodEntries field (even if null/missing)
    const result = await userModel.updateMany(
      { $or: [{ moodEntries: { $exists: false } }, { moodEntries: null }] },
      { $set: { moodEntries: [] } }
    );

    console.log(
      `✅ Updated ${result.modifiedCount} users with missing moodEntries`
    );
  } catch (error) {
    console.error("❌ Error updating users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

fixMoodEntries();
