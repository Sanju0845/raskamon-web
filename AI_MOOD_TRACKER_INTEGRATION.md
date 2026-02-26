# AI Mood Tracker Integration Flow

## Overview

This document outlines the comprehensive AI Mood Tracker integration for the mental health platform, including database extensions, API endpoints, and frontend integration.

## 1. Database Extensions

### User Model Extensions

The user model has been extended with mood tracking preferences:

```javascript
moodTracking: {
  enabled: { type: Boolean, default: false },
  frequency: {
    type: String,
    enum: ['daily', 'twice_daily', 'weekly', 'custom'],
    default: 'daily'
  },
  reminderTimes: [{
    type: String,
    default: ['09:00']
  }],
  aiAnalysisConsent: { type: Boolean, default: false },
  aiAnalysisLevel: {
    type: String,
    enum: ['basic', 'detailed', 'comprehensive'],
    default: 'basic'
  },
  privacySettings: {
    shareWithTherapist: { type: Boolean, default: false },
    shareWithFamily: { type: Boolean, default: false },
    anonymousDataSharing: { type: Boolean, default: false }
  },
  notificationPreferences: {
    moodReminders: { type: Boolean, default: true },
    weeklyInsights: { type: Boolean, default: true },
    crisisAlerts: { type: Boolean, default: true },
    therapistNotifications: { type: Boolean, default: false }
  }
}
```

### New Models Created

#### 1. MoodEntry Model

Stores individual mood tracking entries with comprehensive data:

- **Basic Mood Data**: score, label, timestamp
- **Contextual Data**: activities, location, weather, sleep hours
- **Additional Metrics**: stress level, energy level, social interaction
- **User Input**: text feedback, custom tags
- **Privacy**: public/private flag

#### 2. AIAnalysis Model

Stores AI-generated insights and analysis:

- **Trend Analysis**: mood direction, confidence, contributing factors
- **Pattern Recognition**: triggers, positive activities, risk factors
- **Recommendations**: personalized suggestions with priority levels
- **Risk Assessment**: overall risk level and crisis indicators
- **Metadata**: analysis parameters and processing information

#### 3. MoodGoal Model

Manages user-defined mood improvement goals:

- **Goal Definition**: title, description, target score, frequency
- **Progress Tracking**: streaks, success rates, achievements
- **Achievement System**: milestone tracking and rewards

## 2. API Endpoints

### Base URL

```
/api/mood-tracking
```

### Authentication

All endpoints require user authentication via JWT token.

### Endpoints

#### Mood Entries

- `POST /users/:userId/mood-entries` - Add new mood entry
- `GET /users/:userId/mood-entries` - Get user's mood entries with pagination

#### Analytics

- `GET /users/:userId/mood-analytics` - Get mood analytics and insights
- `GET /users/:userId/ai-analysis` - Get AI analysis results

#### Preferences

- `PUT /users/:userId/mood-preferences` - Update mood tracking preferences

#### Goals

- `POST /users/:userId/mood-goals` - Create new mood goal
- `GET /users/:userId/mood-goals` - Get user's mood goals

## 3. Frontend Integration

### Service Layer

Created `MoodTrackingService` class with:

- **HTTP Client**: Axios with authentication interceptors
- **Data Transformation**: Format data for API and frontend consumption
- **Error Handling**: Centralized error management
- **Batch Operations**: Support for multiple operations
- **Export Functionality**: JSON and CSV export capabilities

### Key Features

#### 1. Mood Entry Creation

```javascript
const moodData = {
  score: 4,
  label: "happy",
  activities: ["exercise", "social"],
  textFeedback: "Had a great workout session",
  stressLevel: 3,
  energyLevel: 8,
};

await moodTrackingService.addMoodEntry(userId, moodData);
```

#### 2. Analytics Retrieval

```javascript
const analytics = await moodTrackingService.getMoodAnalytics(userId, "30");
// Returns: basicStats, moodDistribution, trend, activityCorrelation, timePatterns
```

#### 3. AI Analysis Access

```javascript
const aiAnalysis = await moodTrackingService.getAIAnalysis(userId, "weekly");
// Returns: moodTrend, patterns, recommendations, insights, riskAssessment
```

#### 4. Preferences Management

```javascript
const preferences = {
  enabled: true,
  frequency: "daily",
  aiAnalysisConsent: true,
  aiAnalysisLevel: "detailed",
  privacySettings: {
    shareWithTherapist: true,
    shareWithFamily: false,
  },
};

await moodTrackingService.updateMoodTrackingPreferences(userId, preferences);
```

## 4. AI Analysis Capabilities

### Analysis Types

- **Daily**: Real-time mood tracking and immediate insights
- **Weekly**: Pattern recognition and trend analysis
- **Monthly**: Long-term trend analysis and seasonal patterns
- **Crisis**: Risk assessment and emergency recommendations
- **Pattern**: Deep pattern analysis and predictive insights

### AI Features

#### 1. Trend Analysis

- Mood direction (improving/declining/stable/fluctuating)
- Confidence scoring for predictions
- Contributing factor identification

#### 2. Pattern Recognition

- **Triggers**: Identify negative mood triggers
- **Positive Activities**: Recognize mood-boosting activities
- **Risk Factors**: Detect potential mental health risks

#### 3. Personalized Recommendations

- Activity suggestions based on historical data
- Therapy recommendations when appropriate
- Crisis intervention when needed
- Priority-based recommendation system

#### 4. Risk Assessment

- Overall risk level evaluation
- Crisis indicator detection
- Emergency action recommendations

## 5. Privacy and Security

### Data Protection

- **User Consent**: Explicit consent for AI analysis
- **Privacy Settings**: Granular control over data sharing
- **Anonymous Data**: Option for anonymous data contribution
- **Data Encryption**: Secure storage and transmission

### Privacy Controls

- Share with therapist (with consent)
- Share with family members (with consent)
- Anonymous data sharing for research
- Complete data deletion capability

## 6. Notification System

### Notification Types

- **Mood Reminders**: Scheduled mood tracking reminders
- **Weekly Insights**: AI-generated weekly mood summaries
- **Crisis Alerts**: Emergency notifications for concerning patterns
- **Therapist Notifications**: Professional alerts when appropriate

### Customization

- Reminder frequency and timing
- Notification channel preferences
- Crisis alert sensitivity levels

## 7. Integration Points

### Existing System Integration

- **User Authentication**: Leverages existing JWT authentication
- **Assessment System**: Correlates with mental health assessments
- **Appointment System**: Integrates with therapy sessions
- **Blog System**: Connects with mental health resources

### Future Enhancements

- **Wearable Integration**: Connect with fitness trackers and smartwatches
- **Weather API**: Automatic weather data integration
- **Location Services**: GPS-based context awareness
- **Social Media**: Optional social media mood correlation

## 8. Implementation Status

### Completed

- ✅ Database schema design and implementation
- ✅ API endpoints and controllers
- ✅ Frontend service layer
- ✅ Basic analytics and insights
- ✅ Privacy and security framework

### In Progress

- 🔄 AI analysis algorithms
- 🔄 Real-time notification system
- 🔄 Advanced pattern recognition

### Planned

- 📋 Wearable device integration
- 📋 Advanced AI models
- 📋 Mobile app development
- 📋 Therapist dashboard integration

## 9. Usage Examples

### Basic Mood Tracking

```javascript
// Enable mood tracking
await moodTrackingService.updateMoodTrackingPreferences(userId, {
  enabled: true,
  frequency: "daily",
  aiAnalysisConsent: true,
});

// Add mood entry
await moodTrackingService.addMoodEntry(userId, {
  score: 4,
  label: "happy",
  activities: ["exercise"],
  textFeedback: "Great day!",
});
```

### Analytics and Insights

```javascript
// Get 30-day analytics
const analytics = await moodTrackingService.getMoodAnalytics(userId, "30");

// Get AI analysis
const aiInsights = await moodTrackingService.getAIAnalysis(userId, "weekly");

// Create mood goal
await moodTrackingService.createMoodGoal(userId, {
  title: "Improve Morning Mood",
  targetMoodScore: 4,
  targetFrequency: "daily",
});
```

## 10. Testing and Validation

### API Testing

- Unit tests for all endpoints
- Integration tests for data flow
- Performance testing for large datasets
- Security testing for authentication

### Frontend Testing

- Component testing for UI elements
- Service layer testing
- Error handling validation
- User experience testing

## 11. Deployment Considerations

### Database Migration

- Schema updates for existing users
- Data migration scripts
- Index optimization for performance

### Environment Configuration

- API endpoint configuration
- Authentication token management
- Error logging and monitoring

### Monitoring and Analytics

- Usage tracking and analytics
- Performance monitoring
- Error tracking and alerting
- User feedback collection

This integration provides a comprehensive mood tracking system with AI-powered insights, ensuring user privacy while delivering valuable mental health support.
