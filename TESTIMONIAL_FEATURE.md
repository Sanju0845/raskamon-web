# Testimonial Feature Documentation

## Overview

The testimonial feature allows users to share their experiences with Mood Mantra. After submission, testimonials go through an admin approval process before being displayed publicly.

## Key Features

### 1. User Testimonial Submission

- Users can submit testimonials through a modal form
- Testimonials include: rating, author name, role, quote, and anonymous option
- Form validation ensures quality content (minimum 20 characters)

### 2. Admin Approval Process

- All submitted testimonials require admin approval
- Admins can approve or reject testimonials through the admin panel
- Only approved testimonials appear in the public testimonials section

### 3. User-Specific Functionality

- **Approved Testimonials**: User's approved testimonial appears in the main testimonials grid alongside other approved testimonials
- **Edit/Delete Icons**: Only visible to the testimonial owner (small edit and delete icons in the top-right corner)
- **Pending Testimonials**: Users can see their pending testimonials with status indication

## Implementation Details

### Frontend Components

#### Testimonial.jsx

- Main testimonials display component
- Fetches approved testimonials from backend
- Identifies user's own testimonials using `userId` comparison
- Shows edit/delete icons only for user's own testimonials
- Handles testimonial editing and deletion

#### TestimonialModal.jsx

- Modal form for creating/editing testimonials
- Pre-fills form with existing testimonial data when editing
- Handles form validation and submission

### Backend API

#### Endpoints

- `GET /api/testimonials/approved` - Get all approved testimonials (public)
- `POST /api/testimonials` - Create new testimonial (requires auth)
- `GET /api/testimonials/user/:userId` - Get user's testimonial (requires auth)
- `PUT /api/testimonials/:testimonialId` - Update testimonial (requires auth)
- `DELETE /api/testimonials/:testimonialId` - Delete testimonial (requires auth)

#### Data Model

```javascript
{
  userId: ObjectId,        // Reference to user
  author: String,          // Author name (or "Anonymous")
  role: String,           // Role (Patient, Family Member, etc.)
  quote: String,          // Testimonial content
  rating: Number,         // 1-5 star rating
  isApproved: Boolean,    // Admin approval status
  isAnonymous: Boolean,   // Anonymous submission flag
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

## User Experience Flow

### 1. Submitting a Testimonial

1. User clicks "Share Your Story" button
2. Modal opens with testimonial form
3. User fills in details and submits
4. Testimonial is saved with `isApproved: false`
5. User sees "Under Review" status

### 2. After Admin Approval

1. Admin approves testimonial in admin panel
2. User's testimonial appears in main testimonials grid
3. User sees small edit/delete icons on their testimonial card
4. Other users see the testimonial without edit/delete options

### 3. Editing/Deleting

1. User clicks edit icon → Modal opens with pre-filled form
2. User clicks delete icon → Confirmation dialog → Deletion
3. Changes are immediately reflected in the UI

## Security Features

- **Authentication Required**: All testimonial operations require valid user token
- **Ownership Verification**: Users can only edit/delete their own testimonials
- **Admin Approval**: All testimonials require admin approval before public display
- **Input Validation**: Frontend and backend validation for testimonial content

## Styling and UI

- **Responsive Design**: Testimonials grid adapts to different screen sizes
- **Hover Effects**: Smooth animations and visual feedback
- **Color Coding**: Different gradient colors for testimonial cards
- **Icon Indicators**: Edit/delete icons only visible to testimonial owner
- **Status Indicators**: Clear visual indication of approval status

## Future Enhancements

- **Testimonial Categories**: Filter testimonials by category
- **Search Functionality**: Search through testimonials
- **Pagination**: Load more testimonials on demand
- **Social Sharing**: Share testimonials on social media
- **Testimonial Analytics**: Track testimonial engagement metrics
