import { bucket } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to Firebase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in storage (e.g., 'profile-pictures', 'hiking-pictures')
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToFirebase = async (
  fileBuffer,
  fileName,
  folder,
  mimeType,
) => {
  try {
    // Generate unique filename
    const extension = fileName.split(".").pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${extension}`;

    // Create file reference
    const file = bucket.file(uniqueFileName);

    // Generate a download token for public access
    const downloadToken = uuidv4();

    // Upload file with metadata including the download token
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
      validation: "md5",
    });

    // Make the file publicly accessible (belt and suspenders approach)
    try {
      await file.makePublic();
    } catch (error) {
      console.log("Note: makePublic failed, but token URL should still work");
    }

    // Return Firebase download URL with token
    const encodedPath = encodeURIComponent(uniqueFileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw new Error("Failed to upload image to Firebase Storage");
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromFirebase = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    let filePath;

    // Handle both URL formats:
    // 1. Old format: https://storage.googleapis.com/bucket-name/folder/filename.ext
    // 2. New format: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/folder%2Ffilename.ext?alt=media&token=xxx

    if (fileUrl.includes("firebasestorage.googleapis.com")) {
      // New format - extract from encoded path
      const match = fileUrl.match(/\/o\/([^?]+)/);
      if (match) {
        filePath = decodeURIComponent(match[1]);
      }
    } else if (fileUrl.includes("storage.googleapis.com")) {
      // Old format - extract after bucket name
      const urlParts = fileUrl.split(`${bucket.name}/`);
      if (urlParts.length >= 2) {
        filePath = urlParts[1];
      }
    }

    if (!filePath) {
      console.log("Could not extract file path from URL:", fileUrl);
      return;
    }

    // Delete file
    const file = bucket.file(filePath);
    await file.delete();

    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error.code === 404) {
      console.log("File not found in Firebase Storage, skipping deletion");
    } else {
      console.error("Error deleting from Firebase:", error);
    }
  }
};

/**
 * Delete multiple files from Firebase Storage
 * @param {string[]} fileUrls - Array of file URLs to delete
 * @returns {Promise<void>}
 */
export const deleteMultipleFromFirebase = async (fileUrls) => {
  try {
    if (!fileUrls || fileUrls.length === 0) return;

    const deletePromises = fileUrls.map((url) => deleteFromFirebase(url));
    await Promise.all(deletePromises);

    console.log(`Deleted ${fileUrls.length} files from Firebase Storage`);
  } catch (error) {
    console.error("Error deleting multiple files from Firebase:", error);
  }
};

/**
 * Validate image file
 * @param {object} file - Multer file object
 * @returns {boolean}
 */
export const validateImageFile = (file) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return true;
};
