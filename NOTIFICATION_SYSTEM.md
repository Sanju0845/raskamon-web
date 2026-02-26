# Notification System for Mood Tracking

## Overview

The notification system provides comprehensive mood tracking notifications including reminders, insights, crisis alerts, and goal progress updates. It's designed to support users in their mental health journey with timely, relevant, and actionable notifications.

## Features

### 🔔 Mood Reminders

- **Daily reminders** to track mood based on user preferences
- **Customizable timing** (morning, evening, or custom times)
- **Frequency options** (daily, twice daily, weekly, custom)
- **Smart scheduling** to avoid duplicate reminders

### 📊 Weekly Insights

- **Automated weekly summaries** of mood patterns
- **AI-powered insights** and recommendations
- **Trend analysis** and progress tracking
- **Personalized content** based on user data

### ⚠️ Crisis Alerts

- **Real-time monitoring** of concerning mood patterns
- **Multiple detection algorithms**:
  - Extended low mood periods (5+ days)
  - Consecutive low mood days (3+ days)
  - Rapid mood decline detection
- **Appropriate safeguards** and support resources
- **Configurable sensitivity** levels

### 🎯 Goal Progress

- **Milestone notifications** (25%, 50%, 75% progress)
- **Goal achievement celebrations**
- **Streak milestone tracking** (7, 14, 30, 60, 90, 180, 365 days)
- **Motivational messaging** and encouragement

### 🤖 AI Analysis Ready

- **Automatic notifications** when new AI analysis is available
- **Pattern detection alerts** for new insights
- **Real-time updates** as analysis completes

## Technical Architecture

### Backend Components

#### 1. Notification Model (`backend/models/notificationModel.js`)

```javascript
{
  userId: ObjectId,
  type: "mood_reminder" | "weekly_insights" | "crisis_alert" | "goal_progress" | "goal_achievement" | "ai_analysis_ready" | "streak_milestone" | "pattern_detected",
  title: String,
  message: String,
  priority: "low" | "medium" | "high" | "urgent",
  category: "reminder" | "insight" | "alert" | "achievement" | "milestone" | "analysis",
  data: Object, // Additional context data
  scheduledFor: Date,
  sentAt: Date,
  readAt: Date,
  actionTaken: "dismissed" | "acted_upon" | "snoozed" | "none",
  deliveryMethod: ["in_app", "email", "push", "sms"],
  status: "pending" | "sent" | "delivered" | "failed" | "cancelled"
}
```

#### 2. Notification Service (`backend/services/notificationService.js`)

- **Scheduling engine** for automatic notification creation
- **Pattern detection algorithms** for crisis alerts
- **Goal progress tracking** and milestone detection
- **Streak calculation** and milestone notifications
- **Background processing** with retry logic

#### 3. Notification Controller (`backend/controllers/notificationController.js`)

- **RESTful API endpoints** for notification management
- **User preference management**
- **Notification CRUD operations**
- **Statistics and analytics**

### Frontend Components

#### 1. NotificationBell Component (`frontend/src/components/NotificationBell.jsx`)

- **Real-time notification display** with unread count
- **Dropdown interface** for quick access
- **Search and filtering** capabilities
- **Quick actions** (mark as read, snooze, delete)
- **Preference management** modal

#### 2. Notifications Page (`frontend/src/pages/Notifications.jsx`)

- **Comprehensive notification management**
- **Advanced filtering** and search
- **Statistics dashboard**
- **Bulk actions** (mark all read, delete)
- **Detailed notification view**

#### 3. Notification Service (`frontend/src/services/notificationService.js`)

- **API integration** with backend
- **Data transformation** for frontend consumption
- **Helper methods** for UI components
- **Error handling** and retry logic

## API Endpoints

### Notification Management

```
GET    /api/notifications/users/:userId/notifications
GET    /api/notifications/users/:userId/notification-stats
PUT    /api/notifications/users/:userId/notifications/:notificationId/read
PUT    /api/notifications/users/:userId/notifications/read-all
PUT    /api/notifications/users/:userId/notifications/:notificationId/snooze
DELETE /api/notifications/users/:userId/notifications/:notificationId
```

### Preferences Management

```
GET    /api/notifications/users/:userId/notification-preferences
PUT    /api/notifications/users/:userId/notification-preferences
```

### History and Analytics

```
GET    /api/notifications/users/:userId/notification-history
```

### Testing and Development

```
POST   /api/notifications/users/:userId/test-notification
POST   /api/notifications/users/:userId/trigger-checks
```

## Configuration

### User Preferences

Users can configure their notification preferences:

```javascript
{
  moodReminders: true,        // Daily mood tracking reminders
  weeklyInsights: true,       // Weekly mood analysis summaries
  crisisAlerts: true,         // Alerts for concerning patterns
  therapistNotifications: false // Share with healthcare providers
}
```

### Reminder Times

- **Default**: 9:00 AM daily
- **Customizable**: Multiple times per day
- **Time zones**: User's local timezone

### Crisis Alert Sensitivity

- **Low**: 7+ consecutive low mood days
- **Medium**: 5+ low mood days in a week
- **High**: 3+ consecutive low mood days
- **Rapid decline**: 1.5+ point drop in average mood

## Integration Points

### Mood Tracking Integration

- **Automatic triggers** after mood entry creation
- **Real-time pattern analysis** for crisis detection
- **Goal progress tracking** and milestone detection
- **Streak calculation** and milestone notifications

### AI Analysis Integration

- **Automatic notifications** when analysis completes
- **Pattern detection** for new insights
- **Recommendation delivery** through notifications

### User Experience Integration

- **Navbar integration** with notification bell
- **Real-time updates** without page refresh
- **Actionable notifications** with direct links
- **Preference management** in user settings

## Security and Privacy

### Data Protection

- **User-specific notifications** with proper isolation
- **Encrypted data transmission** (HTTPS)
- **Authentication required** for all endpoints
- **Audit logging** for sensitive operations

### Privacy Controls

- **Granular preference settings** for each notification type
- **Opt-out options** for all notification categories
- **Data retention policies** for notification history
- **GDPR compliance** with data deletion capabilities

### Crisis Alert Safeguards

- **Rate limiting** to prevent alert spam
- **Escalation protocols** for urgent situations
- **Support resource integration** for crisis situations
- **Professional oversight** capabilities

## Testing

### Manual Testing

```bash
# Test notification system
node backend/test-notifications.js

# Clean up test data
node backend/test-notifications.js cleanup
```

### Automated Testing

- **Unit tests** for notification service functions
- **Integration tests** for API endpoints
- **E2E tests** for notification workflows
- **Performance tests** for high-volume scenarios

## Monitoring and Analytics

### Key Metrics

- **Notification delivery rates**
- **User engagement** with notifications
- **Crisis alert accuracy** and false positive rates
- **System performance** and response times

### Health Checks

- **Service availability** monitoring
- **Database performance** tracking
- **Error rate** monitoring
- **User feedback** collection

## Future Enhancements

### Planned Features

- **Push notifications** for mobile devices
- **Email integration** for important alerts
- **SMS notifications** for crisis situations
- **Voice notifications** for accessibility
- **Machine learning** for improved pattern detection
- **Integration** with external mental health services

### Scalability Improvements

- **Queue-based processing** for high-volume scenarios
- **Microservice architecture** for better separation
- **Caching layer** for improved performance
- **Multi-tenant support** for healthcare providers

## Troubleshooting

### Common Issues

#### Notifications Not Appearing

1. Check user notification preferences
2. Verify notification service is running
3. Check database connectivity
4. Review server logs for errors

#### Crisis Alerts Not Triggering

1. Verify user has sufficient mood data
2. Check alert sensitivity settings
3. Review pattern detection algorithms
4. Ensure user has crisis alerts enabled

#### Performance Issues

1. Monitor database query performance
2. Check notification service intervals
3. Review background job processing
4. Optimize notification queries

### Debug Commands

```bash
# Check notification service status
curl http://localhost:4000/api/notifications/health

# Test notification creation
curl -X POST http://localhost:4000/api/notifications/users/:userId/test-notification \
  -H "Content-Type: application/json" \
  -d '{"type": "mood_reminder", "title": "Test", "message": "Test notification"}'

# Get notification statistics
curl http://localhost:4000/api/notifications/users/:userId/notification-stats
```

## Support and Maintenance

### Regular Maintenance

- **Database cleanup** of old notifications
- **Performance optimization** of queries
- **Security updates** and patches
- **User feedback** collection and analysis

### Support Resources

- **Documentation** for developers
- **User guides** for end users
- **Troubleshooting guides** for common issues
- **Contact information** for technical support

---

This notification system is designed to be robust, scalable, and user-friendly while maintaining the highest standards of privacy and security for mental health applications.
