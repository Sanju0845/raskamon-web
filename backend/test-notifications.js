import mongoose from "mongoose";
import "dotenv/config";
import notificationService from "./services/notificationService.js";
import Notification from "./models/notificationModel.js";
import userModel from "./models/userModel.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test notification functions
const testNotifications = async () => {
  try {
    console.log("🧪 Testing Notification System...\n");

    // Get a test user (first user in the database)
    const user = await userModel.findOne();
    if (!user) {
      console.log("❌ No users found in database. Please create a user first.");
      return;
    }

    console.log(`👤 Testing with user: ${user.name} (${user._id})\n`);

    // Test 1: Create a test notification
    console.log("1️⃣ Creating test notification...");
    const testNotification = await Notification.create({
      userId: user._id,
      type: "mood_reminder",
      title: "Test Mood Reminder",
      message: "This is a test notification to verify the system is working.",
      priority: "medium",
      category: "reminder",
      scheduledFor: new Date(),
      status: "sent",
      sentAt: new Date(),
    });
    console.log("✅ Test notification created:", testNotification._id);

    // Test 2: Get user notifications
    console.log("\n2️⃣ Fetching user notifications...");
    const notifications = await notificationService.getUserNotifications(
      user._id,
      {
        page: 1,
        limit: 10,
      }
    );
    console.log(`✅ Found ${notifications.notifications.length} notifications`);

    // Test 3: Get notification stats
    console.log("\n3️⃣ Getting notification statistics...");
    const stats = await notificationService.getNotificationStats(user._id);
    console.log("✅ Notification stats:", stats);

    // Test 4: Mark notification as read
    console.log("\n4️⃣ Marking notification as read...");
    const markedNotification = await notificationService.markNotificationAsRead(
      testNotification._id,
      user._id
    );
    console.log("✅ Notification marked as read:", markedNotification.readAt);

    // Test 5: Test different notification types
    console.log("\n5️⃣ Creating different types of notifications...");

    const notificationTypes = [
      {
        type: "weekly_insights",
        title: "Weekly Mood Insights",
        message: "Your weekly mood analysis is ready!",
        priority: "low",
        category: "insight",
      },
      {
        type: "goal_achievement",
        title: "Goal Achieved! 🎉",
        message: "Congratulations! You've achieved your mood goal.",
        priority: "high",
        category: "achievement",
      },
      {
        type: "crisis_alert",
        title: "We're here to support you",
        message: "We've noticed some concerning patterns in your mood.",
        priority: "urgent",
        category: "alert",
      },
    ];

    for (const notificationData of notificationTypes) {
      const notification = await Notification.create({
        userId: user._id,
        ...notificationData,
        scheduledFor: new Date(),
        status: "sent",
        sentAt: new Date(),
      });
      console.log(
        `✅ Created ${notificationData.type} notification:`,
        notification._id
      );
    }

    // Test 6: Schedule notifications for user
    console.log("\n6️⃣ Scheduling notifications for user...");
    await notificationService.scheduleUserNotifications(user);
    console.log("✅ Notifications scheduled");

    // Test 7: Process pending notifications
    console.log("\n7️⃣ Processing pending notifications...");
    await notificationService.processPendingNotifications();
    console.log("✅ Pending notifications processed");

    // Final stats
    console.log("\n📊 Final Statistics:");
    const finalStats = await notificationService.getNotificationStats(user._id);
    console.log(finalStats);

    console.log("\n🎉 All tests completed successfully!");
    console.log(
      "\nTo clean up test data, run: node cleanup-test-notifications.js"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Cleanup function
const cleanup = async () => {
  try {
    console.log("🧹 Cleaning up test notifications...");

    const user = await userModel.findOne();
    if (!user) {
      console.log("❌ No users found");
      return;
    }

    // Delete test notifications
    const result = await Notification.deleteMany({
      userId: user._id,
      title: {
        $regex:
          /^Test|Weekly Mood Insights|Goal Achieved|We're here to support you/,
      },
    });

    console.log(`✅ Deleted ${result.deletedCount} test notifications`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
};

// Main execution
const main = async () => {
  await connectDB();

  const command = process.argv[2];

  if (command === "cleanup") {
    await cleanup();
  } else {
    await testNotifications();
  }

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
};

main().catch(console.error);
