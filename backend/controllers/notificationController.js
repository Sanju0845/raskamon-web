import notificationService from "../services/notificationService.js";
import userModel from "../models/userModel.js";

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, unreadOnly, type } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === "true",
      type,
    };

    const result = await notificationService.getUserNotifications(
      userId,
      options
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await notificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Snooze notification
export const snoozeNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    const { minutes } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = await notificationService.snoozeNotification(
      notificationId,
      userId,
      minutes || 30
    );

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification snoozed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await notificationService.deleteNotification(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = await notificationService.getNotificationStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notificationPreferences } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update notification preferences
    const updateData = {};
    if (notificationPreferences) {
      Object.keys(notificationPreferences).forEach((key) => {
        updateData[`moodTracking.notificationPreferences.${key}`] =
          notificationPreferences[key];
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    // Reschedule notifications based on new preferences
    await notificationService.scheduleUserNotifications(updatedUser);

    res.status(200).json({
      success: true,
      data: {
        notificationPreferences:
          updatedUser.moodTracking.notificationPreferences,
      },
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        notificationPreferences: user.moodTracking?.notificationPreferences || {
          moodReminders: true,
          weeklyInsights: true,
          crisisAlerts: true,
          therapistNotifications: false,
        },
        reminderTimes: user.moodTracking?.reminderTimes || ["09:00"],
        frequency: user.moodTracking?.frequency || "daily",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test notification (for development/testing)
export const testNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, title, message } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a test notification
    const Notification = (await import("../models/notificationModel.js"))
      .default;

    const testNotification = await Notification.create({
      userId,
      type: type || "mood_reminder",
      title: title || "Test Notification",
      message: message || "This is a test notification",
      priority: "medium",
      category: "reminder",
      scheduledFor: new Date(),
      status: "sent",
      sentAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: testNotification,
      message: "Test notification created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Manually trigger notification checks (for admin/testing)
export const triggerNotificationChecks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually trigger notification checks for the user
    await notificationService.scheduleUserNotifications(user);

    res.status(200).json({
      success: true,
      message: "Notification checks triggered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get notification history with filters
export const getNotificationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 50,
      type,
      category,
      priority,
      startDate,
      endDate,
      status,
    } = req.query;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    const query = { userId };

    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const Notification = (await import("../models/notificationModel.js"))
      .default;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
