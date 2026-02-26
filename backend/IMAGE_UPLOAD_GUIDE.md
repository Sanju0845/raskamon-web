# Image Upload Feature Guide

## Overview

Users can now upload images from their PC when submitting blog posts. The feature includes drag-and-drop support, image preview, and automatic upload to the server.

## Features

### ✅ Image Upload Capabilities

- **File Selection**: Click to browse and select images
- **Drag & Drop**: Drag images directly onto the upload area
- **File Validation**: Only accepts image files (JPG, PNG, GIF)
- **Size Limit**: Maximum 5MB per image
- **Preview**: Shows image preview before upload
- **Upload Status**: Real-time upload progress indicators

### ✅ User Experience

- **Visual Feedback**: Loading spinners and status messages
- **Error Handling**: Clear error messages for invalid files
- **File Management**: Remove selected images before upload
- **Responsive Design**: Works on desktop and mobile

## How to Test

### Step 1: Start the Backend

```bash
cd backend
npm start
```

### Step 2: Start the Frontend

```bash
cd frontend
npm run dev
```

### Step 3: Test Image Upload

1. **Navigate to Resources page**: `http://localhost:5173/resources`
2. **Click "Write a Blog Post"**
3. **Fill in the form**:
   - Title: "Test Post with Image"
   - Category: Select any category
   - Content: Write some content
   - Tags: Add some tags

### Step 4: Upload an Image

1. **Click the image upload area** or **drag an image file** onto it
2. **Select an image file** (JPG, PNG, or GIF under 5MB)
3. **Verify the preview** appears
4. **Click "Upload"** button
5. **Wait for upload confirmation**

### Step 5: Submit the Post

1. **Complete the form** and submit
2. **Check admin panel** for the new post with uploaded image
3. **Approve the post** in admin panel
4. **Verify image appears** on the frontend Resources page

## API Endpoints

### Upload Image

```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <user_token>

Body:
- image: File (image file)
```

### Response

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "http://localhost:4000/uploads/blog-image-1234567890.jpg",
    "filename": "blog-image-1234567890.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000
  }
}
```

### Serve Image

```
GET /uploads/<filename>
```

## File Storage

- **Location**: `backend/uploads/` directory
- **Naming**: `blog-image-<timestamp>-<random>.jpg`
- **Access**: Via `/uploads/<filename>` URL
- **Git**: Uploads directory is in `.gitignore`

## Error Handling

### File Type Errors

- Only image files accepted
- Clear error message displayed

### File Size Errors

- Maximum 5MB limit
- User-friendly error message

### Upload Errors

- Network issues handled gracefully
- Retry functionality available

## Security Features

- **Authentication**: Only logged-in users can upload
- **File Validation**: Server-side file type checking
- **Size Limits**: Prevents large file uploads
- **Unique Names**: Prevents filename conflicts

## Browser Support

- **Modern Browsers**: Full drag-and-drop support
- **Mobile**: File picker works on mobile devices
- **Fallback**: Click to select works everywhere

## Testing Checklist

- [ ] Can select image by clicking upload area
- [ ] Can drag and drop image files
- [ ] Image preview shows correctly
- [ ] Upload button works and shows progress
- [ ] Error messages for invalid files
- [ ] Error messages for oversized files
- [ ] Can remove selected image
- [ ] Uploaded image appears in blog post
- [ ] Image displays correctly on frontend
- [ ] Works with different image formats (JPG, PNG, GIF)
- [ ] Works on mobile devices

## Troubleshooting

### Image Not Uploading

1. Check backend server is running
2. Verify file size is under 5MB
3. Ensure file is an image format
4. Check browser console for errors

### Image Not Displaying

1. Verify upload was successful
2. Check image URL in browser
3. Ensure uploads directory exists
4. Check file permissions

### Upload Area Not Working

1. Check JavaScript console for errors
2. Verify all dependencies are loaded
3. Test with different browsers
4. Check network connectivity
