# Mood Tracking Error Fixes

## Overview
This document explains the common errors you're experiencing with the mood tracking feature and provides solutions to fix them.

## Errors Encountered

### 1. 403 Forbidden - AI Analysis Consent Error
**Error Message**: `AI analysis consent not given`
**Cause**: The user's `moodTracking.aiAnalysisConsent` field is set to `false` in the database
**Solution**: Users need to enable AI analysis consent in their settings

### 2. 400 Bad Request - Mood Tracking Not Enabled Error
**Error Message**: `Mood tracking is not enabled for this user`
**Cause**: The user's `moodTracking.enabled` field is set to `false` in the database
**Solution**: Users need to enable mood tracking first

## Fixes Implemented

### Frontend Fixes

1. **Enhanced Error Handling**: Added proper checks before making API calls
2. **User-Friendly UI**: Added a screen to enable mood tracking when disabled
3. **Settings Management**: Made toggles functional in the settings page
4. **Graceful Degradation**: AI analysis errors don't break the main functionality

### Backend Fixes

1. **New API Endpoint**: Added `GET /api/mood-tracking/users/:userId/mood-preferences` to fetch user preferences
2. **Better Error Messages**: More descriptive error responses
3. **Default Values**: Proper default values for new users

### Key Changes Made

#### 1. MoodTracker.jsx
- Added check for mood tracking enabled before loading data
- Added enable mood tracking functionality
- Improved error handling for AI analysis
- Made settings toggles functional

#### 2. moodTrackingService.js
- Added `getMoodTrackingPreferences()` method
- Added `enableMoodTracking()` method
- Better error handling

#### 3. moodTrackingController.js
- Added `getMoodTrackingPreferences()` controller
- Better validation and error messages

#### 4. moodTrackingRoute.js
- Added GET route for preferences

## How to Fix the Issues

### For Existing Users

1. **Run the Enable Script** (Recommended):
   ```bash
   cd backend
   node scripts/enableMoodTracking.js
   ```

2. **Manual Database Update**:
   ```javascript
   // Update specific user
   db.users.updateOne(
     { _id: ObjectId("user_id_here") },
     { 
       $set: { 
         "moodTracking.enabled": true,
         "moodTracking.aiAnalysisConsent": false 
       } 
     }
   )
   ```

### For New Users

The system now automatically sets proper defaults:
- `moodTracking.enabled`: `false` (users must enable manually)
- `moodTracking.aiAnalysisConsent`: `false` (privacy-first approach)

### User Experience Flow

1. **First Visit**: User sees "Enable Mood Tracking" screen
2. **Enable Tracking**: User clicks button to enable mood tracking
3. **Settings**: User can toggle AI analysis and other preferences
4. **Normal Usage**: Full mood tracking functionality available

## Testing the Fixes

1. **Test with Disabled User**:
   - Visit mood tracker page
   - Should see enable screen
   - Click enable button
   - Should work normally

2. **Test AI Analysis**:
   - Go to settings
   - Enable AI analysis
   - Check analytics page
   - Should show AI insights

3. **Test Error Handling**:
   - Disable mood tracking
   - Try to add mood entry
   - Should show appropriate error message

## Security Considerations

- AI analysis consent defaults to `false` for privacy
- Users must explicitly enable features
- All preferences are stored securely in the database
- Authentication required for all mood tracking operations

## Troubleshooting

### If errors persist:

1. **Check Database**: Verify user has mood tracking preferences
2. **Check Authentication**: Ensure user is logged in
3. **Check Network**: Verify API endpoints are accessible
4. **Check Console**: Look for detailed error messages

### Common Issues:

1. **CORS Errors**: Ensure backend allows frontend domain
2. **Authentication Errors**: Check token validity
3. **Database Connection**: Verify MongoDB connection
4. **Missing Fields**: Ensure user model has mood tracking schema

## Future Improvements

1. **Onboarding Flow**: Guided setup for new users
2. **Privacy Controls**: More granular privacy settings
3. **Data Export**: Allow users to export their mood data
4. **Notifications**: Push notifications for mood reminders
5. **Analytics**: More detailed mood analytics and insights
