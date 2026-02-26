import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  snoozeNotification,
  deleteNotification,
  getNotificationStats,
  updateNotificationPreferences,
  getNotificationPreferences,
  testNotification,
  triggerNotificationChecks,
  getNotificationHistory,
} from "../controllers/notificationController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authUser);

// Get user notifications
router.get("/users/:userId/notifications", getUserNotifications);

// Get notification statistics
router.get("/users/:userId/notification-stats", getNotificationStats);

// Get notification preferences
router.get(
  "/users/:userId/notification-preferences",
  getNotificationPreferences
);

// Update notification preferences
router.put(
  "/users/:userId/notification-preferences",
  updateNotificationPreferences
);

// Mark notification as read
router.put(
  "/users/:userId/notifications/:notificationId/read",
  markNotificationAsRead
);

// Mark all notifications as read
router.put("/users/:userId/notifications/read-all", markAllNotificationsAsRead);

// Snooze notification
router.put(
  "/users/:userId/notifications/:notificationId/snooze",
  snoozeNotification
);

// Delete notification
router.delete(
  "/users/:userId/notifications/:notificationId",
  deleteNotification
);

// Get notification history with filters
router.get("/users/:userId/notification-history", getNotificationHistory);

// Test notification (for development/testing)
router.post("/users/:userId/test-notification", testNotification);

// Manually trigger notification checks (for admin/testing)
router.post("/users/:userId/trigger-checks", triggerNotificationChecks);

// Clear all notifications for testing (for development/testing)
router.delete("/users/:userId/clear-all", async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationService = (
      await import("../services/notificationService.js")
    ).default;
    await notificationService.clearAllNotificationsForUser(userId);
    res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
