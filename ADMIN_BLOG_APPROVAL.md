# Admin Blog Post Approval Flow

## Overview

This document describes the complete admin approval flow for blog posts in the mental health platform. The system allows admins to review, approve, reject, or request revisions for user-submitted blog posts.

## Features Implemented

### 1. Admin Dashboard Integration

- **Pending Posts Counter**: Shows the number of posts awaiting review on the admin dashboard
- **Clickable Card**: The pending posts card is clickable and navigates to the review page
- **Real-time Updates**: Dashboard data updates automatically when posts are reviewed

### 2. Review Posts Page (`/review-posts`)

- **Post List View**: Displays all pending posts with preview information
- **Post Details**: Shows title, excerpt, author, submission date, category, and tags
- **Full Post Modal**: Click "View Full Post" to read the complete content
- **Action Buttons**: Approve, Reject, Request Revision, and View Full Post

### 3. Review Actions

#### Approve Post

- Changes status to "approved"
- Sets publishedAt timestamp
- Option to mark as featured post
- Optional admin notes
- Post becomes visible to all users immediately

#### Reject Post

- Changes status to "rejected"
- Optional rejection reason in admin notes
- Author is notified of rejection

#### Request Revision

- Keeps status as "pending"
- Sends revision request with admin notes
- Author can update and resubmit the post

### 4. User Interface Features

- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Progress bars and loading indicators
- **Tooltips**: Helpful hints for all action buttons
- **Status Indicators**: Color-coded status badges
- **Modal Dialogs**: Clean, accessible review forms
- **Animations**: Smooth transitions and hover effects

## Technical Implementation

### Backend (Already Implemented)

- **Blog Post Model**: Includes status, adminNotes, publishedAt fields
- **API Endpoints**:
  - `GET /api/blog-posts/admin/pending` - Get pending posts
  - `PUT /api/blog-posts/admin/:id/review` - Review a post
- **Dashboard Integration**: Pending posts count in admin dashboard

### Frontend (New Implementation)

- **AdminContext**: Added blog post management functions
- **BlogPosts Component**: Complete review interface
- **Dashboard Updates**: Pending posts counter and navigation
- **Sidebar Navigation**: "Review Posts" menu item

## File Structure

```
admin/src/
├── context/
│   └── AdminContext.jsx          # Added blog post functions
├── pages/Admin/
│   ├── Dashboard.jsx             # Updated with pending posts card
│   └── BlogPosts.jsx             # New review page
├── components/
│   └── Sidebar.jsx               # Added Review Posts navigation
├── App.jsx                       # Added BlogPosts route
└── index.css                     # Added line-clamp utilities

backend/
├── controllers/
│   ├── adminController.js        # Updated dashboard with pending count
│   └── blogPostController.js     # Already implemented
├── models/
│   └── blogPostModel.js          # Already implemented
└── routes/
    └── blogPostRoute.js          # Already implemented
```

## Usage Flow

### 1. Admin Login

- Admin logs into the dashboard
- Dashboard shows pending posts count in the overview cards

### 2. Access Review Page

- Click on the "Pending Posts" card on dashboard, OR
- Navigate to "Review Posts" in the sidebar

### 3. Review Process

- View list of pending posts with previews
- Click "View Full Post" to read complete content
- Choose action:
  - **Approve**: Post goes live immediately
  - **Reject**: Post is rejected with reason
  - **Request Revision**: Author gets feedback for changes

### 4. Post Review Modal

- Select action type (approve/reject/revision)
- Add optional notes/feedback
- For approvals: Option to mark as featured
- Submit review

## API Endpoints

### Get Pending Posts

```http
GET /api/blog-posts/admin/pending
Headers: { aToken: "admin_token" }
```

### Review Post

```http
PUT /api/blog-posts/admin/:id/review
Headers: { aToken: "admin_token" }
Body: {
  status: "approved" | "rejected",
  adminNotes: "string",
  isFeatured: boolean
}
```

## Status Flow

```
User Submits Post → Pending → Admin Reviews → Approved/Rejected/Revision Request
                                                      ↓
                                              Published/Rejected/Updated
```

## Security Features

- Admin authentication required for all review actions
- Proper authorization checks on backend
- Input validation and sanitization
- Secure token-based authentication

## Future Enhancements

- Email notifications to authors
- Bulk approval/rejection
- Post scheduling for approved posts
- Advanced filtering and search
- Post analytics and performance metrics
- Content moderation guidelines
- Automated content screening

## Testing

To test the implementation:

1. Start the backend server
2. Start the admin frontend
3. Login as admin
4. Navigate to "Review Posts" section
5. Test all review actions with sample posts

## Dependencies

- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Motion for animations
- React Toastify for notifications
- Tailwind CSS for styling
