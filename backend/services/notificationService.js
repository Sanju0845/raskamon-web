import Notification from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import { MoodEntry, MoodGoal } from "../models/moodTrackingModel.js";

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 300000; // Check every 5 minutes instead of every minute
    this.scheduleInterval = 3600000; // Schedule notifications every hour
  }

  // Start the notification service
  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    // Schedule notifications only once when service starts
    this.scheduleNotifications();

    // Process any pending notifications immediately
    this.processPendingNotifications();

    // Set up periodic checks - only process pending notifications
    this.interval = setInterval(() => {
      this.processPendingNotifications();
    }, this.checkInterval);

    // Set up periodic scheduling - schedule new notifications every hour
    this.scheduleIntervalId = setInterval(() => {
      this.scheduleNotifications();
    }, this.scheduleInterval);

    console.log("Notification service started");
  }

  // Stop the notification service
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.scheduleIntervalId) {
      clearInterval(this.scheduleIntervalId);
    }
    console.log("Notification service stopped");
  }

  // Schedule notifications for all users
  async scheduleNotifications() {
    try {
      const users = await userModel.find({
        "moodTracking.enabled": true,
      });

      for (const user of users) {
        await this.scheduleUserNotifications(user);
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  // Schedule notifications for a specific user (useful when user enables mood tracking)
  async scheduleNotificationsForUser(userId) {
    try {
      const user = await userModel.findById(userId);
      if (user && user.moodTracking?.enabled) {
        await this.scheduleUserNotifications(user);
        console.log(`Scheduled notifications for user ${userId}`);
      }
    } catch (error) {
      console.error(
        `Error scheduling notifications for user ${userId}:`,
        error
      );
    }
  }

  // Clear pending notifications for a user (useful when user disables mood tracking)
  async clearPendingNotificationsForUser(userId) {
    try {
      await Notification.updateMany(
        { userId, status: "pending" },
        { status: "cancelled" }
      );
      console.log(`Cleared pending notifications for user ${userId}`);
    } catch (error) {
      console.error(`Error clearing notifications for user ${userId}:`, error);
    }
  }

  // Clear all notifications for a user (for testing/debugging)
  async clearAllNotificationsForUser(userId) {
    try {
      await Notification.deleteMany({ userId });
      console.log(`Cleared all notifications for user ${userId}`);
    } catch (error) {
      console.error(
        `Error clearing all notifications for user ${userId}:`,
        error
      );
    }
  }

  // Schedule notifications for a specific user
  async scheduleUserNotifications(user) {
    try {
      const { moodTracking } = user;
      if (!moodTracking?.enabled) return;

      // Schedule mood reminders
      if (moodTracking.notificationPreferences?.moodReminders) {
        await this.scheduleMoodReminders(user._id, moodTracking);
      }

      // Schedule weekly insights
      if (moodTracking.notificationPreferences?.weeklyInsights) {
        await this.scheduleWeeklyInsights(user._id);
      }

      // Check for crisis alerts
      if (moodTracking.notificationPreferences?.crisisAlerts) {
        await this.checkForCrisisAlerts(user._id);
      }

      // Check for goal progress
      await this.checkForGoalProgress(user._id);

      // Check for streak milestones
      await this.checkForStreakMilestones(user._id);
    } catch (error) {
      console.error(
        `Error scheduling notifications for user ${user._id}:`,
        error
      );
    }
  }

  // Schedule mood reminders for a user
  async scheduleMoodReminders(userId, moodTracking) {
    try {
      const reminderTimes = moodTracking.reminderTimes || ["09:00"];
      const frequency = moodTracking.frequency || "daily";

      for (const time of reminderTimes) {
        const [hours, minutes] = time.split(":").map(Number);
        const now = new Date();
        let scheduledTime = new Date(now);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Check if we already have a reminder scheduled for this time
        const existingReminder = await Notification.findOne({
          userId,
          type: "mood_reminder",
          status: "pending",
          "data.reminderType": frequency,
          scheduledFor: {
            $gte: new Date(scheduledTime.getTime() - 24 * 60 * 60 * 1000),
            $lt: new Date(scheduledTime.getTime() + 24 * 60 * 60 * 1000),
          },
        });

        if (!existingReminder) {
          await Notification.createMoodReminder(userId, scheduledTime);
        }
      }
    } catch (error) {
      console.error(
        `Error scheduling mood reminders for user ${userId}:`,
        error
      );
    }
  }

  // Schedule weekly insights
  async scheduleWeeklyInsights(userId) {
    try {
      // Check if we already have a weekly insight scheduled for this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const existingInsight = await Notification.findOne({
        userId,
        type: "weekly_insights",
        status: "pending",
        scheduledFor: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      });

      if (!existingInsight) {
        // Schedule for Sunday evening
        const scheduledTime = new Date(startOfWeek);
        scheduledTime.setDate(scheduledTime.getDate() + 6); // Sunday
        scheduledTime.setHours(20, 0, 0, 0); // 8 PM

        if (scheduledTime > new Date()) {
          await Notification.createWeeklyInsights(userId, {
            summary: "Your weekly mood analysis is ready",
          });
        }
      }
    } catch (error) {
      console.error(
        `Error scheduling weekly insights for user ${userId}:`,
        error
      );
    }
  }

  // Check for crisis alerts
  async checkForCrisisAlerts(userId) {
    try {
      // Get recent mood entries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentEntries = await MoodEntry.find({
        userId,
        timestamp: { $gte: sevenDaysAgo },
      }).sort({ timestamp: -1 });

      if (recentEntries.length < 3) return; // Need at least 3 entries

      // Check for concerning patterns
      const lowMoodEntries = recentEntries.filter(
        (entry) => entry.moodScore <= 2
      );
      const consecutiveLowMood = this.checkConsecutiveLowMood(recentEntries);
      const rapidDecline = this.checkRapidMoodDecline(recentEntries);

      let alertData = null;

      if (lowMoodEntries.length >= 5) {
        alertData = {
          pattern: "extended_low_mood",
          severity: "high",
          message: "You've been experiencing low mood for several days",
          recommendations: [
            "Consider reaching out to a mental health professional",
            "Try engaging in activities you usually enjoy",
            "Connect with friends or family members",
          ],
        };
      } else if (consecutiveLowMood >= 3) {
        alertData = {
          pattern: "consecutive_low_mood",
          severity: "medium",
          message: "You've had several consecutive days of low mood",
          recommendations: [
            "Take some time for self-care activities",
            "Consider talking to someone you trust",
            "Try some mood-boosting exercises",
          ],
        };
      } else if (rapidDecline) {
        alertData = {
          pattern: "rapid_mood_decline",
          severity: "high",
          message: "We've noticed a sudden decline in your mood",
          recommendations: [
            "This might be a good time to seek support",
            "Try to identify what might have triggered this change",
            "Consider reaching out to a counselor or therapist",
          ],
        };
      }

      if (alertData) {
        // Check if we already have a recent crisis alert
        const recentAlert = await Notification.findOne({
          userId,
          type: "crisis_alert",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        });

        if (!recentAlert) {
          await Notification.createCrisisAlert(userId, alertData);
        }
      }
    } catch (error) {
      console.error(`Error checking crisis alerts for user ${userId}:`, error);
    }
  }

  // Check for goal progress
  async checkForGoalProgress(userId) {
    try {
      const activeGoals = await MoodGoal.find({
        userId,
        isActive: true,
      });

      for (const goal of activeGoals) {
        const progress = goal.progress;
        if (!progress) continue;

        // Check for goal achievement
        if (
          progress.currentStreak >= goal.targetFrequency &&
          !goal.achievements?.length
        ) {
          // Check if we already have a recent goal achievement notification
          const recentAchievement = await Notification.findOne({
            userId,
            type: "goal_achievement",
            "data.goalId": goal._id,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          });

          if (!recentAchievement) {
            await Notification.createGoalAchievement(userId, {
              goalTitle: goal.title,
              goalId: goal._id,
              achievementType: "streak_completed",
              daysAchieved: progress.currentStreak,
            });
          }
        }

        // Check for milestone progress (every 25% of goal)
        const milestoneThresholds = [0.25, 0.5, 0.75];
        const progressPercentage =
          progress.currentStreak / goal.targetFrequency;

        for (const threshold of milestoneThresholds) {
          if (
            progressPercentage >= threshold &&
            !progress.milestones?.includes(threshold)
          ) {
            // Check if we already have a recent goal progress notification for this milestone
            const recentProgress = await Notification.findOne({
              userId,
              type: "goal_progress",
              "data.goalId": goal._id,
              "data.milestone": threshold,
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
            });

            if (!recentProgress) {
              await Notification.createGoalProgress(userId, {
                goalTitle: goal.title,
                goalId: goal._id,
                message: `You're ${(threshold * 100).toFixed(
                  0
                )}% of the way to your goal!`,
                progressPercentage: threshold,
                milestone: threshold,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error checking goal progress for user ${userId}:`, error);
    }
  }

  // Check for streak milestones
  async checkForStreakMilestones(userId) {
    try {
      const entries = await MoodEntry.find({ userId }).sort({ timestamp: -1 });

      if (entries.length === 0) return;

      // Calculate current streak
      const currentStreak = this.calculateStreak(entries);

      // Milestone thresholds
      const milestones = [7, 14, 30, 60, 90, 180, 365];

      for (const milestone of milestones) {
        if (currentStreak === milestone) {
          // Check if we already notified about this milestone
          const existingNotification = await Notification.findOne({
            userId,
            type: "streak_milestone",
            "data.days": milestone,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          });

          if (!existingNotification) {
            await Notification.createStreakMilestone(userId, {
              days: milestone,
              streakType: "tracking",
            });
          }
        }
      }
    } catch (error) {
      console.error(
        `Error checking streak milestones for user ${userId}:`,
        error
      );
    }
  }

  // Process pending notifications
  async processPendingNotifications() {
    try {
      const pendingNotifications = await Notification.find({
        status: "pending",
        scheduledFor: { $lte: new Date() },
      }).populate("userId", "name email moodTracking");

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error("Error processing pending notifications:", error);
    }
  }

  // Send a notification
  async sendNotification(notification) {
    try {
      // Update status to sent
      notification.status = "sent";
      notification.sentAt = new Date();
      await notification.save();

      // Here you would integrate with actual notification services
      // For now, we'll just log the notification
      console.log(`Notification sent to user ${notification.userId}:`, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
      });

      // In a real implementation, you would:
      // 1. Send push notification if enabled
      // 2. Send email if enabled
      // 3. Send SMS if enabled
      // 4. Update status to "delivered" or "failed"
    } catch (error) {
      console.error(`Error sending notification ${notification._id}:`, error);

      // Handle retry logic
      notification.retryCount += 1;
      if (notification.retryCount >= notification.maxRetries) {
        notification.status = "failed";
      }
      await notification.save();
    }
  }

  // Helper methods for pattern detection
  checkConsecutiveLowMood(entries) {
    let consecutive = 0;
    for (const entry of entries) {
      if (entry.moodScore <= 2) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  }

  checkRapidMoodDecline(entries) {
    if (entries.length < 3) return false;

    const recentScores = entries.slice(0, 3).map((e) => e.moodScore);
    const averageRecent =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (entries.length >= 7) {
      const olderScores = entries.slice(3, 7).map((e) => e.moodScore);
      const averageOlder =
        olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

      return averageRecent < averageOlder - 1.5; // Significant decline
    }

    return false;
  }

  calculateStreak(entries) {
    if (entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].timestamp);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // API methods for frontend
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false, type } = options;
      const skip = (page - 1) * limit;

      let query = { userId };

      if (unreadOnly) {
        query.readAt = null;
      }

      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, readAt: null },
        { readAt: new Date(), actionTaken: "dismissed" }
      );

      return { message: "All notifications marked as read" };
    } catch (error) {
      throw new Error(
        `Error marking all notifications as read: ${error.message}`
      );
    }
  }

  async snoozeNotification(notificationId, userId, minutes = 30) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.snooze(minutes);
      return notification;
    } catch (error) {
      throw new Error(`Error snoozing notification: ${error.message}`);
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      return { message: "Notification deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Get notification statistics for a user
  async getNotificationStats(userId) {
    try {
      const [
        totalNotifications,
        unreadCount,
        readCount,
        pendingCount,
        sentCount,
      ] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, readAt: null }),
        Notification.countDocuments({ userId, readAt: { $ne: null } }),
        Notification.countDocuments({ userId, status: "pending" }),
        Notification.countDocuments({ userId, status: "sent" }),
      ]);

      return {
        total: totalNotifications,
        unread: unreadCount,
        read: readCount,
        pending: pendingCount,
        sent: sentCount,
      };
    } catch (error) {
      throw new Error(`Error fetching notification stats: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
