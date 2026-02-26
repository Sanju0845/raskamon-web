# Doctor Patient Mood Data Feature

## Overview

This feature allows therapists/doctors to view their patients' mood tracking data, providing valuable insights into their patients' emotional well-being and mental health patterns.

## Features Implemented

### 1. Backend API Endpoint

**Endpoint:** `GET /api/doctor/patient-mood-data`

**Parameters:**

- `patientId` (required): The ID of the patient
- `period` (optional): Time period in days (default: 30)

**Response includes:**

- Patient information (name, email, phone, mood tracking status)
- Mood data analytics (average score, trend, stability, variability)
- Recent mood entries with timestamps and activities
- AI analysis results (if available and consented)
- Appointment history with the doctor

**Security:**

- Requires doctor authentication
- Verifies doctor has appointments with the patient
- Respects patient privacy settings

### 2. Frontend Components

#### PatientMoodData Component (`admin/src/pages/Doctor/PatientMoodData.jsx`)

- Displays patient mood tracking information
- Shows key metrics (average mood, total entries, AI analysis)
- Period selector (week, month, quarter, year)
- Recent mood entries with emoji indicators
- Patient information and mood tracking status

#### Enhanced MyPatients Component

- Added "View Mood Data" button in patient details modal
- Direct access to patient mood tracking information

#### Enhanced Doctor Dashboard

- Added "Quick Actions" section
- Direct link to patient list for mood data access

## How to Use

### For Doctors:

1. **Access Patient List:**

   - Navigate to "My Patients" from the sidebar
   - Or click "View All Patients" from the Quick Actions section

2. **View Patient Mood Data:**

   - Click on any patient to open patient details
   - Click "View Mood Data" button
   - Or navigate directly to `/patient-mood-data?patientId=<patient_id>`

3. **Analyze Mood Data:**
   - View key metrics and trends
   - Check recent mood entries
   - Review AI analysis insights (if available)
   - Adjust time period as needed

### For Patients:

1. **Enable Mood Tracking:**

   - Patients must enable mood tracking in their settings
   - Optionally give consent for AI analysis

2. **Privacy Control:**
   - Patients control their mood tracking settings
   - Can disable tracking at any time
   - Can revoke AI analysis consent

## Data Structure

### Patient Mood Data Response:

```json
{
  "success": true,
  "patient": {
    "_id": "patient_id",
    "name": "Patient Name",
    "email": "patient@email.com",
    "phone": "1234567890",
    "moodTrackingEnabled": true,
    "aiAnalysisConsent": true
  },
  "moodData": {
    "entries": [...],
    "analytics": {
      "basicStats": {
        "totalEntries": 15,
        "averageScore": 3.8,
        "minScore": 2,
        "maxScore": 5
      },
      "trend": "improving",
      "trendStrength": 0.7,
      "moodVariability": 0.3,
      "moodStability": 0.7
    },
    "aiAnalysis": {...},
    "totalEntries": 15,
    "period": 30
  },
  "appointments": {
    "total": 5,
    "completed": 3,
    "cancelled": 1,
    "pending": 1,
    "history": [...]
  }
}
```

## Security & Privacy

### Authentication:

- All endpoints require valid doctor authentication
- JWT token validation

### Authorization:

- Doctors can only view mood data for patients they have appointments with
- Patient consent is respected for mood tracking and AI analysis

### Data Protection:

- Patient mood data is encrypted in transit
- Access is logged for audit purposes
- Patients can revoke access at any time

## Technical Implementation

### Backend Files Modified:

- `backend/controllers/doctorController.js` - Added `getPatientMoodData` function
- `backend/routes/doctorRoute.js` - Added new route
- `backend/models/moodTrackingModel.js` - Existing mood tracking models

### Frontend Files Modified:

- `admin/src/pages/Doctor/PatientMoodData.jsx` - New component
- `admin/src/pages/Doctor/MyPatients.jsx` - Added mood data button
- `admin/src/pages/Doctor/DoctorDashboard.jsx` - Added quick actions
- `admin/src/App.jsx` - Added routing

## Error Handling

### Common Error Scenarios:

1. **Patient not found** - Returns 404 with appropriate message
2. **No permission** - Returns 403 if doctor has no appointments with patient
3. **Mood tracking disabled** - Returns success with null mood data
4. **Invalid period** - Defaults to 30 days
5. **Authentication failed** - Returns 401

## Future Enhancements

### Potential Improvements:

1. **Export functionality** - Allow doctors to export patient mood reports
2. **Comparative analysis** - Compare mood data across multiple patients
3. **Alert system** - Notify doctors of concerning mood patterns
4. **Treatment correlation** - Link mood data to treatment effectiveness
5. **Advanced charts** - More detailed visualizations and trends

### Analytics Features:

1. **Mood correlation with appointments** - Track mood changes around sessions
2. **Treatment response tracking** - Monitor mood improvements over time
3. **Seasonal patterns** - Identify seasonal mood variations
4. **Activity impact analysis** - Understand what activities affect mood

## Testing

### Manual Testing:

1. Login as a doctor
2. Navigate to "My Patients"
3. Click on a patient with mood tracking enabled
4. Click "View Mood Data"
5. Verify data displays correctly
6. Test different time periods

### API Testing:

Use the provided test script (`backend/test-patient-mood-endpoint.js`) with valid credentials.

## Troubleshooting

### Common Issues:

1. **No mood data shown** - Check if patient has enabled mood tracking
2. **Permission denied** - Verify doctor has appointments with the patient
3. **Empty analytics** - Patient may not have enough mood entries
4. **AI analysis missing** - Patient may not have given consent

### Debug Steps:

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Confirm patient has mood tracking enabled
4. Check doctor authentication token
5. Verify patient ID is correct

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.
