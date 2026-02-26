import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const enableMoodTrackingForUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all users without mood tracking enabled
    const users = await userModel.find({
      $or: [
        { "moodTracking.enabled": { $exists: false } },
        { "moodTracking.enabled": false }
      ]
    });

    console.log(`Found ${users.length} users without mood tracking enabled`);

    // Enable mood tracking for each user
    for (const user of users) {
      const updateData = {
        "moodTracking.enabled": true,
        "moodTracking.frequency": "daily",
        "moodTracking.aiAnalysisConsent": false, // Default to false for privacy
        "moodTracking.aiAnalysisLevel": "basic",
        "moodTracking.privacySettings": {
          shareWithTherapist: false,
          shareWithFamily: false,
          anonymousDataSharing: false,
        },
        "moodTracking.notificationPreferences": {
          moodReminders: true,
          weeklyInsights: true,
          crisisAlerts: true,
          therapistNotifications: false,
        },
      };

      await userModel.findByIdAndUpdate(user._id, { $set: updateData });
      console.log(`Enabled mood tracking for user: ${user.email}`);
    }

    console.log("Mood tracking enabled for all users successfully!");
  } catch (error) {
    console.error("Error enabling mood tracking:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
enableMoodTrackingForUsers();
