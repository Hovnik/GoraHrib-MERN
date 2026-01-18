# Firebase Storage Integration Setup Guide

## Overview

Firebase Storage has been integrated into your backend for storing:

- Profile pictures (`/profile-pictures`)
- Hiking pictures from forum posts (`/hiking-pictures`)

## Setup Steps

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Navigate to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### 2. Configure Service Account

#### Option A: Local Development

1. Save the downloaded JSON file as `firebase-service-account.json` in your `backend/` folder
2. **IMPORTANT**: This file is already in `.gitignore` - never commit it!

#### Option B: Production (Environment Variable)

Set the entire JSON content as an environment variable:

```bash
FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", "project_id": "your-project",...}'
```

### 3. Set Storage Bucket

Add to your `.env` file:

```
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Replace `your-project-id` with your actual Firebase project ID.

### 4. Configure Storage Rules

In Firebase Console, go to **Storage** → **Rules** and set:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - authenticated users can upload their own
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Hiking pictures - authenticated users can upload
    match /hiking-pictures/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null;
    }
  }
}
```

## API Changes

### Profile Picture Upload

**Endpoint**: `PUT /api/user/profile-picture`

**Before** (JSON):

```javascript
{
  "url": "data:image/jpeg;base64,...",
  "crop": { "x": 0, "y": 0, "zoom": 1 }
}
```

**After** (Multipart Form Data):

```javascript
FormData:
  - profilePicture: <File>
  - crop: '{"x": 0, "y": 0, "zoom": 1}'  // JSON string (optional)
```

**Example Frontend Code**:

```javascript
const formData = new FormData();
formData.append("profilePicture", file);
formData.append("crop", JSON.stringify({ x: 0, y: 0, zoom: 1 }));

await axios.put("/api/user/profile-picture", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});
```

### Forum Post Creation

**Endpoint**: `POST /api/forum`

**Before** (JSON):

```javascript
{
  "title": "My Hike",
  "content": "Great hike!",
  "category": "Hike",
  "pictures": ["base64string1", "base64string2"]
}
```

**After** (Multipart Form Data):

```javascript
FormData:
  - title: "My Hike"
  - content: "Great hike!"
  - category: "Hike"
  - pictures: <File>  // can append multiple files
  - pictures: <File>
  - pictures: <File>
```

**Example Frontend Code**:

```javascript
const formData = new FormData();
formData.append("title", title);
formData.append("content", content);
formData.append("category", "Hike");

// Add multiple pictures (max 5)
files.forEach((file) => {
  formData.append("pictures", file);
});

await axios.post("/api/forum", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});
```

## Features

### Automatic Features

- ✅ Images uploaded to Firebase Storage
- ✅ Public URLs returned and stored in database
- ✅ Old images deleted when updating profile picture
- ✅ All post images deleted when deleting forum post
- ✅ File validation (JPEG, PNG, WebP only, max 5MB)
- ✅ Unique filenames using UUID
- ✅ Support for multiple images per post (max 5)

### File Validation

- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Max file size**: 5MB per file
- **Max files per post**: 5 images

## Database Schema

No changes needed! The existing models already support Firebase URLs:

**User Model**:

```javascript
profilePicture: {
  url: String,  // Now stores Firebase URL
  crop: { x: Number, y: Number, zoom: Number }
}
```

**ForumPost Model**:

```javascript
pictures: [String]; // Array of Firebase URLs
```

## Testing

### Test Profile Picture Upload

```bash
curl -X PUT http://localhost:3000/api/user/profile-picture \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profilePicture=@path/to/image.jpg" \
  -F 'crop={"x": 0, "y": 0, "zoom": 1}'
```

### Test Forum Post with Pictures

```bash
curl -X POST http://localhost:3000/api/forum \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Hike" \
  -F "content=Amazing experience!" \
  -F "category=Hike" \
  -F "pictures=@path/to/image1.jpg" \
  -F "pictures=@path/to/image2.jpg"
```

## Troubleshooting

### "Firebase Admin SDK not initialized"

- Check that `firebase-service-account.json` exists in `backend/` folder
- Or verify `FIREBASE_SERVICE_ACCOUNT` environment variable is set

### "Failed to upload image to Firebase Storage"

- Verify `FIREBASE_STORAGE_BUCKET` is correct in `.env`
- Check Firebase Storage is enabled in Firebase Console
- Verify Storage Rules allow write access

### "Invalid file type"

- Only JPEG, PNG, and WebP are allowed
- Check file MIME type

### "File size too large"

- Maximum file size is 5MB
- Compress images before uploading

## Security Notes

1. **Never commit** `firebase-service-account.json` to version control
2. Service account has admin privileges - protect it carefully
3. Use environment variables in production
4. Keep Firebase Storage rules restrictive
5. Consider adding file scanning for malware in production

## Next Steps for Frontend

1. Update profile picture upload to use FormData instead of base64
2. Update forum post creation to use FormData for images
3. Handle file selection and preview in UI
4. Add image compression before upload (optional)
5. Display Firebase URLs in image tags
