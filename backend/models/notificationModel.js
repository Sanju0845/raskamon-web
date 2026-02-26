import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "mood_reminder",
        "weekly_insights",
        "crisis_alert",
        "goal_progress",
        "goal_achievement",
        "ai_analysis_ready",
        "streak_milestone",
        "pattern_detected",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "reminder",
        "insight",
        "alert",
        "achievement",
        "milestone",
        "analysis",
      ],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionTaken: {
      type: String,
      enum: ["dismissed", "acted_upon", "snoozed", "none"],
      default: "none",
    },
    deliveryMethod: {
      type: [String],
      enum: ["in_app", "email", "push", "sms"],
      default: ["in_app"],
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "cancelled"],
      default: "pending",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Add comprehensive indexes for better query performance
notificationSchema.index({ userId: 1, status: 1 }); // For user's notifications by status
notificationSchema.index({ userId: 1, scheduledFor: 1 }); // For user's scheduled notifications
notificationSchema.index({ userId: 1, readAt: 1 }); // For user's read/unread notifications
notificationSchema.index({ type: 1, status: 1 }); // For notification type and status
notificationSchema.index({ scheduledFor: 1, status: "pending" }); // For pending notifications
notificationSchema.index({ userId: 1 }); // For all user notifications
notificationSchema.index({ status: 1 }); // For status-based queries
notificationSchema.index({ type: 1 }); // For type-based queries
notificationSchema.index({ priority: 1 }); // For priority-based queries
notificationSchema.index({ category: 1 }); // For category-based queries
notificationSchema.index({ createdAt: -1 }); // For sorting by creation date
notificationSchema.index({ sentAt: -1 }); // For sorting by sent date
notificationSchema.index({ readAt: -1 }); // For sorting by read date
notificationSchema.index({ actionTaken: 1 }); // For action-based queries
notificationSchema.index({ retryCount: 1 }); // For retry-based queries

// Compound indexes for common query patterns
notificationSchema.index({ userId: 1, type: 1 }); // For user's notifications by type
notificationSchema.index({ userId: 1, priority: 1 }); // For user's notifications by priority
notificationSchema.index({ userId: 1, category: 1 }); // For user's notifications by category
notificationSchema.index({ userId: 1, actionTaken: 1 }); // For user's notifications by action
notificationSchema.index({ status: 1, scheduledFor: 1 }); // For status and scheduling
notificationSchema.index({ type: 1, priority: 1 }); // For type and priority
notificationSchema.index({ category: 1, priority: 1 }); // For category and priority
notificationSchema.index({ userId: 1, createdAt: -1 }); // For user's notifications sorted by date
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 }); // For unread notifications sorted
notificationSchema.index({ status: 1, retryCount: 1 }); // For failed notifications with retries
notificationSchema.index({ priority: 1, scheduledFor: 1 }); // For priority-based scheduling
notificationSchema.index({ userId: 1, type: 1, status: 1 }); // For user's notifications by type and status

// Text index for search functionality
notificationSchema.index({
  title: "text",
  message: "text",
});

// Virtual for checking if notification is overdue
notificationSchema.virtual("isOverdue").get(function () {
  return this.scheduledFor < new Date() && this.status === "pending";
});

// Virtual for checking if notification is actionable
notificationSchema.virtual("isActionable").get(function () {
  return ["crisis_alert", "goal_achievement", "pattern_detected"].includes(
    this.type
  );
});

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.readAt = new Date();
  this.actionTaken = "dismissed";
  return this.save();
};

// Method to mark as acted upon
notificationSchema.methods.markAsActedUpon = function () {
  this.readAt = new Date();
  this.actionTaken = "acted_upon";
  return this.save();
};

// Method to snooze notification
notificationSchema.methods.snooze = function (minutes = 30) {
  this.scheduledFor = new Date(Date.now() + minutes * 60 * 1000);
  this.actionTaken = "snoozed";
  this.status = "pending";
  return this.save();
};

// Static method to get pending notifications for a user
notificationSchema.statics.getPendingNotifications = function (userId) {
  return this.find({
    userId,
    status: "pending",
    scheduledFor: { $lte: new Date() },
  }).sort({ scheduledFor: 1 });
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function (userId) {
  return this.find({
    userId,
    readAt: null,
  }).sort({ createdAt: -1 });
};

// Static method to create mood reminder
notificationSchema.statics.createMoodReminder = function (
  userId,
  scheduledFor
) {
  return this.create({
    userId,
    type: "mood_reminder",
    title: "Time to check in with your mood",
    message:
      "Take a moment to reflect on how you're feeling today. Your mood tracking helps you understand your emotional patterns.",
    priority: "medium",
    category: "reminder",
    scheduledFor,
    data: {
      actionType: "track_mood",
      reminderType: "daily",
    },
  });
};

// Static method to create weekly insights notification
notificationSchema.statics.createWeeklyInsights = function (userId, insights) {
  return this.create({
    userId,
    type: "weekly_insights",
    title: "Your Weekly Mood Insights",
    message: `Here's what we learned about your mood this week: ${insights.summary}`,
    priority: "low",
    category: "insight",
    scheduledFor: new Date(),
    data: {
      insights,
      actionType: "view_insights",
    },
  });
};

// Static method to create crisis alert
notificationSchema.statics.createCrisisAlert = function (userId, alertData) {
  return this.create({
    userId,
    type: "crisis_alert",
    title: "We're here to support you",
    message:
      "We've noticed some concerning patterns in your mood. Remember, you're not alone and help is available.",
    priority: "urgent",
    category: "alert",
    scheduledFor: new Date(),
    data: {
      ...alertData,
      actionType: "seek_support",
      crisisResources: true,
    },
  });
};

// Static method to create goal progress notification
notificationSchema.statics.createGoalProgress = function (userId, goalData) {
  return this.create({
    userId,
    type: "goal_progress",
    title: "Goal Progress Update",
    message: `Great progress on your mood goal! ${goalData.message}`,
    priority: "medium",
    category: "achievement",
    scheduledFor: new Date(),
    data: {
      ...goalData,
      actionType: "view_goal",
    },
  });
};

// Static method to create goal achievement notification
notificationSchema.statics.createGoalAchievement = function (userId, goalData) {
  return this.create({
    userId,
    type: "goal_achievement",
    title: "Goal Achieved! 🎉",
    message: `Congratulations! You've achieved your mood goal: ${goalData.goalTitle}`,
    priority: "high",
    category: "achievement",
    scheduledFor: new Date(),
    data: {
      ...goalData,
      actionType: "celebrate_achievement",
    },
  });
};

// Static method to create streak milestone notification
notificationSchema.statics.createStreakMilestone = function (
  userId,
  streakData
) {
  return this.create({
    userId,
    type: "streak_milestone",
    title: "Streak Milestone! 🔥",
    message: `Amazing! You've been tracking your mood for ${streakData.days} days in a row!`,
    priority: "medium",
    category: "milestone",
    scheduledFor: new Date(),
    data: {
      ...streakData,
      actionType: "view_streak",
    },
  });
};

// Static method to create pattern detection notification
notificationSchema.statics.createPatternDetection = function (
  userId,
  patternData
) {
  return this.create({
    userId,
    type: "pattern_detected",
    title: "New Pattern Detected",
    message: `We've identified a new pattern in your mood: ${patternData.description}`,
    priority: "medium",
    category: "analysis",
    scheduledFor: new Date(),
    data: {
      ...patternData,
      actionType: "view_pattern",
    },
  });
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
