# AI Mood Tracker Testing Guide

## 🧪 **Testing Overview**

This guide provides comprehensive testing instructions for the AI Mood Tracker integration, including API testing, frontend testing, and end-to-end workflows.

## 📋 **Prerequisites**

1. **Backend Server Running**

   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend Server Running**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   - MongoDB running locally or cloud instance
   - Environment variables configured

## 🔧 **API Testing**

### 1. **User Authentication Test**

**Endpoint:** `POST /api/user/login`

```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### 2. **Enable Mood Tracking Test**

**Endpoint:** `PUT /api/mood-tracking/users/:userId/mood-preferences`

```bash
curl -X PUT http://localhost:4000/api/mood-tracking/users/USER_ID/mood-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "enabled": true,
    "frequency": "daily",
    "aiAnalysisConsent": true,
    "aiAnalysisLevel": "detailed"
  }'
```

### 3. **Add Mood Entry Test**

**Endpoint:** `POST /api/mood-tracking/users/:userId/mood-entries`

```bash
curl -X POST http://localhost:4000/api/mood-tracking/users/USER_ID/mood-entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "moodScore": 4,
    "moodLabel": "happy",
    "activities": ["exercise", "social"],
    "textFeedback": "Had a great workout session with friends",
    "stressLevel": 3,
    "energyLevel": 8,
    "socialInteraction": 7,
    "sleepHours": 8
  }'
```

### 4. **Get Mood Analytics Test**

**Endpoint:** `GET /api/mood-tracking/users/:userId/mood-analytics`

```bash
curl -X GET "http://localhost:4000/api/mood-tracking/users/USER_ID/mood-analytics?period=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. **Get AI Analysis Test**

**Endpoint:** `GET /api/mood-tracking/users/:userId/ai-analysis`

```bash
curl -X GET "http://localhost:4000/api/mood-tracking/users/USER_ID/ai-analysis?analysisType=weekly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 **Frontend Testing**

### 1. **Access Mood Tracker**

1. Navigate to `http://localhost:5173/moodtracker`
2. Verify login requirement if not authenticated
3. Login with test credentials

### 2. **Mood Entry Creation**

1. **Select Mood**

   - Click on different mood options (very_happy, happy, neutral, sad, etc.)
   - Verify visual feedback (color changes, selection state)

2. **Select Activities**

   - Click on activity buttons (exercise, work, social, etc.)
   - Verify multiple selection works
   - Verify deselection works

3. **Adjust Metrics**

   - Use sliders for stress level, energy level, social interaction
   - Verify values update in real-time
   - Test edge cases (min/max values)

4. **Add Text Feedback**

   - Type in the text area
   - Verify character count
   - Test with long text (near 1000 character limit)

5. **Submit Entry**
   - Click "Save Mood Entry"
   - Verify success message
   - Verify form resets

### 3. **Analytics View**

1. **Navigate to Analytics**

   - Click "Analytics" tab
   - Verify data loads

2. **Check Statistics**

   - Verify average mood score
   - Verify total entries count
   - Verify trend direction
   - Verify lowest mood score

3. **AI Insights**
   - Check if AI analysis appears
   - Verify recommendations display
   - Check priority levels and colors

### 4. **Goals View**

1. **Navigate to Goals**

   - Click "Goals" tab
   - Verify goals list displays

2. **Goal Progress**
   - Check progress bars
   - Verify streak counts
   - Check target scores

### 5. **Settings View**

1. **Navigate to Settings**

   - Click "Settings" tab
   - Verify toggles display

2. **Toggle Settings**
   - Test mood tracking toggle
   - Test AI analysis toggle
   - Test notification toggles

## 🔄 **End-to-End Testing Scenarios**

### **Scenario 1: New User Journey**

1. **Register/Login**

   - Create new account or login
   - Verify user data loads

2. **Enable Mood Tracking**

   - Go to settings
   - Enable mood tracking
   - Enable AI analysis

3. **First Mood Entry**

   - Create first mood entry
   - Verify entry saves
   - Check analytics (should show "no data" initially)

4. **Multiple Entries**

   - Add 5-7 mood entries over different days
   - Use varied mood scores and activities
   - Verify analytics populate

5. **AI Analysis**
   - Check analytics tab
   - Verify AI insights appear
   - Check recommendations

### **Scenario 2: Data Analysis Testing**

1. **Create Test Data**

   ```javascript
   // Add these mood entries via API or UI
   const testEntries = [
     {
       moodScore: 5,
       moodLabel: "very_happy",
       activities: ["exercise", "social"],
     },
     { moodScore: 4, moodLabel: "happy", activities: ["work", "family"] },
     { moodScore: 2, moodLabel: "sad", activities: ["work"], stressLevel: 8 },
     { moodScore: 3, moodLabel: "neutral", activities: ["sleep"] },
     { moodScore: 4, moodLabel: "happy", activities: ["exercise", "hobby"] },
   ];
   ```

2. **Verify Analytics**

   - Check average score calculation
   - Verify trend analysis
   - Check activity correlations

3. **Verify AI Insights**
   - Check mood trend direction
   - Verify pattern recognition
   - Check recommendations

### **Scenario 3: Error Handling**

1. **Invalid Data**

   - Try submitting empty mood entry
   - Try invalid mood scores
   - Try invalid activity names

2. **Network Errors**

   - Disconnect internet
   - Try mood entry submission
   - Verify error handling

3. **Authentication Errors**
   - Use expired token
   - Try accessing without token
   - Verify proper redirects

## 📊 **Performance Testing**

### 1. **Load Testing**

```bash
# Test with multiple concurrent requests
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/mood-tracking/users/USER_ID/mood-analytics
```

### 2. **Database Performance**

```javascript
// Test with large datasets
// Add 1000+ mood entries and test analytics performance
```

### 3. **Frontend Performance**

- Test with slow network (Chrome DevTools)
- Test with large datasets
- Verify smooth animations

## 🐛 **Common Issues & Solutions**

### **Issue 1: CORS Errors**

**Solution:** Ensure backend CORS configuration includes frontend URL

### **Issue 2: Authentication Failures**

**Solution:** Check token format and expiration

### **Issue 3: Database Connection**

**Solution:** Verify MongoDB connection string and network access

### **Issue 4: AI Analysis Not Appearing**

**Solution:**

1. Check if user has given AI consent
2. Verify mood entries exist
3. Check AI service logs

### **Issue 5: Frontend Not Loading**

**Solution:**

1. Check Vite dev server
2. Verify environment variables
3. Check console for errors

## 📈 **Data Validation**

### 1. **Mood Score Validation**

- Must be between 1-5
- Must be integer
- Required field

### 2. **Mood Label Validation**

- Must be from predefined enum
- Required field

### 3. **Activities Validation**

- Must be from predefined list
- Optional field
- Array format

### 4. **Text Feedback Validation**

- Max 1000 characters
- Optional field

## 🔒 **Security Testing**

### 1. **Authentication**

- Test with invalid tokens
- Test with expired tokens
- Test without tokens

### 2. **Authorization**

- Test accessing other users' data
- Test modifying other users' preferences

### 3. **Data Validation**

- Test SQL injection attempts
- Test XSS attempts
- Test malformed JSON

## 📱 **Mobile Testing**

### 1. **Responsive Design**

- Test on different screen sizes
- Test on mobile browsers
- Test touch interactions

### 2. **Performance**

- Test on slow mobile networks
- Test with limited memory
- Test battery usage

## 🚀 **Deployment Testing**

### 1. **Environment Variables**

- Verify all environment variables set
- Test with production database
- Test with production API endpoints

### 2. **Build Process**

- Test production build
- Test deployment scripts
- Test environment switching

## 📝 **Test Data Setup**

### **Sample User Data**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### **Sample Mood Entries**

```json
[
  {
    "moodScore": 5,
    "moodLabel": "very_happy",
    "activities": ["exercise", "social"],
    "textFeedback": "Amazing day!",
    "stressLevel": 2,
    "energyLevel": 9,
    "socialInteraction": 8,
    "sleepHours": 8
  },
  {
    "moodScore": 3,
    "moodLabel": "neutral",
    "activities": ["work"],
    "textFeedback": "Regular work day",
    "stressLevel": 5,
    "energyLevel": 6,
    "socialInteraction": 4,
    "sleepHours": 7
  }
]
```

## ✅ **Success Criteria**

### **API Success Criteria**

- [ ] All endpoints return correct status codes
- [ ] Data validation works properly
- [ ] Authentication/authorization works
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

### **Frontend Success Criteria**

- [ ] All UI components render correctly
- [ ] User interactions work smoothly
- [ ] Data displays accurately
- [ ] Error states are handled gracefully
- [ ] Responsive design works

### **Integration Success Criteria**

- [ ] End-to-end workflows complete successfully
- [ ] Data flows correctly between frontend and backend
- [ ] AI analysis generates meaningful insights
- [ ] Real-time updates work
- [ ] User experience is intuitive

## 📞 **Support & Troubleshooting**

If you encounter issues during testing:

1. **Check Console Logs** - Both frontend and backend
2. **Verify Network Requests** - Use browser DevTools
3. **Check Database** - Verify data is being saved
4. **Review Environment** - Ensure all variables are set
5. **Check Dependencies** - Ensure all packages are installed

For additional support, refer to the main documentation or create an issue in the project repository.
