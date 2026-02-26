# Testing Guide: Admin Blog Approval Flow

## Overview

This guide will help you test the complete admin blog approval flow from user submission to admin review and approval.

## Prerequisites

1. Backend server running on `http://localhost:4000`
2. Frontend running on `http://localhost:5173`
3. Admin frontend running on `http://localhost:5174`
4. MongoDB database connected

## Method 1: Manual Testing (Recommended)

### Step 1: Create Test Data

First, let's add some test blog posts to the database:

```bash
cd backend
node seedBlogPosts.js
```

This will create 3 test blog posts with "pending" status.

### Step 2: Test Admin Panel

1. **Start the admin frontend:**

   ```bash
   cd admin
   npm run dev
   ```

2. **Login as admin:**

   - Go to `http://localhost:5174/login`
   - Use admin credentials (check your backend for admin email/password)

3. **Check Dashboard:**

   - You should see a "Pending Posts" card showing "3 Pending Posts"
   - Click on the "Pending Posts" card to navigate to the review page

4. **Review Posts:**
   - You'll see 3 test blog posts in the list
   - Click "View Full Post" to read complete content
   - Test all three actions:
     - **Approve**: Mark as approved (with optional featured flag)
     - **Reject**: Reject with reason
     - **Request Revision**: Send feedback for changes

### Step 3: Test User Submission

1. **Start the frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Create user account:**

   - Go to `http://localhost:5173/login?type=signup`
   - Create a new account

3. **Submit a blog post:**
   - Navigate to Resources page: `http://localhost:5173/resources`
   - Click "Write a Blog Post"
   - Fill out the form and submit
   - Check admin panel again - you should see the new post

## Method 2: Quick Test with Seed Data

If you want to quickly test without manual submission:

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Seed test data
cd backend
node seedBlogPosts.js

# Terminal 3: Start admin panel
cd admin
npm run dev
```

Then login to admin panel and test the review functionality.

## Expected Behavior

### Admin Dashboard

- ✅ Shows pending posts count
- ✅ Clickable "Pending Posts" card
- ✅ Navigates to review page

### Review Posts Page

- ✅ Lists all pending posts with previews
- ✅ Shows post details (title, author, date, category, tags)
- ✅ "View Full Post" modal works
- ✅ Three action buttons: Approve, Reject, Request Revision
- ✅ Review modal with notes input
- ✅ Featured post option for approvals
- ✅ Real-time updates after actions

### Post Actions

- ✅ **Approve**: Status changes to "approved", post goes live
- ✅ **Reject**: Status changes to "rejected", post is hidden
- ✅ **Request Revision**: Status stays "pending", admin notes saved

## Troubleshooting

### No Pending Posts Showing

1. Check if backend is running: `http://localhost:4000/test`
2. Verify database connection
3. Run seed script: `node seedBlogPosts.js`
4. Check admin authentication

### Admin Login Issues

1. Verify admin credentials in your backend
2. Check if admin user exists in database
3. Ensure admin routes are working

### Frontend Issues

1. Check if all servers are running
2. Verify API endpoints are accessible
3. Check browser console for errors

## API Endpoints to Test

### Get Pending Posts

```bash
curl -X GET "http://localhost:4000/api/blog-posts/admin/pending" \
  -H "aToken: YOUR_ADMIN_TOKEN"
```

### Review a Post

```bash
curl -X PUT "http://localhost:4000/api/blog-posts/admin/POST_ID/review" \
  -H "Content-Type: application/json" \
  -H "aToken: YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "approved",
    "adminNotes": "Great post!",
    "isFeatured": true
  }'
```

### Submit Blog Post (from frontend)

```bash
curl -X POST "http://localhost:4000/api/blog-posts/submit" \
  -H "Content-Type: application/json" \
  -H "token: USER_TOKEN" \
  -d '{
    "title": "Test Post",
    "category": "mental-health",
    "content": "Test content...",
    "tags": "test, mental-health"
  }'
```

## Success Criteria

- ✅ Admin can see pending posts count on dashboard
- ✅ Admin can navigate to review page
- ✅ Admin can view full post content
- ✅ Admin can approve posts with notes
- ✅ Admin can reject posts with reasons
- ✅ Admin can request revisions
- ✅ Posts status updates correctly
- ✅ Dashboard updates in real-time
- ✅ User can submit new posts
- ✅ All modals and forms work properly

## Next Steps

Once testing is complete, you can:

1. Add email notifications for authors
2. Implement post scheduling
3. Add bulk approval/rejection
4. Create post analytics
5. Add content moderation guidelines
