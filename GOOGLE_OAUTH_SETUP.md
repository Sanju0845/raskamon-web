# Google OAuth Setup Guide

This guide will help you set up Google OAuth login for your mental health application.

## Prerequisites

1. A Google Cloud Console account
2. Node.js and npm installed
3. Your application running locally

## Step 1: Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when deployed)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (when deployed)
5. Copy the Client ID (you'll need this for environment variables)

## Step 2: Environment Variables

### Frontend (.env file in frontend directory)

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (.env file in backend directory)

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
JWT_SECRET=your_jwt_secret_here
# ... other existing environment variables
```

## Step 3: Install Dependencies

The required dependencies are already installed:

- Frontend: `@react-oauth/google`
- Backend: `google-auth-library`

## Step 4: Test the Integration

1. Start your backend server: `npm run server` (in backend directory)
2. Start your frontend: `npm run dev` (in frontend directory)
3. Navigate to the login page
4. Click the "Continue with Google" button
5. Complete the Google OAuth flow

## Features Implemented

✅ **Google OAuth Login**: Users can log in directly with their Google account
✅ **Automatic Account Creation**: New users are automatically created when they first log in with Google
✅ **Account Linking**: If a user already exists with the same email, their account is linked to Google OAuth
✅ **Profile Picture**: Google profile pictures are automatically imported
✅ **Email Verification**: Google's email verification status is tracked
✅ **Seamless Integration**: Works alongside existing email/password authentication

## Security Features

- Google ID tokens are verified on the backend
- JWT tokens are used for session management
- Email verification status is tracked
- Secure token validation

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**:

   - Make sure your Google Client ID is correct
   - Ensure the domain is added to authorized origins in Google Cloud Console

2. **"Redirect URI mismatch" error**:

   - Add your development and production URLs to authorized redirect URIs in Google Cloud Console

3. **"Google login failed" error**:

   - Check that the Google+ API is enabled in Google Cloud Console
   - Verify your environment variables are set correctly

4. **Backend connection issues**:
   - Ensure your backend server is running
   - Check that the backend URL in your frontend environment variables is correct

## Production Deployment

When deploying to production:

1. Update the authorized origins and redirect URIs in Google Cloud Console
2. Set production environment variables
3. Ensure HTTPS is enabled (Google OAuth requires secure connections in production)
4. Update the backend URL in frontend environment variables

## Database Schema Changes

The user model has been updated to support Google OAuth:

- `googleId`: Unique Google user ID
- `isGoogleUser`: Boolean flag for Google OAuth users
- `emailVerified`: Email verification status from Google
- `password`: Made optional for Google OAuth users

This allows seamless integration between traditional email/password authentication and Google OAuth.

