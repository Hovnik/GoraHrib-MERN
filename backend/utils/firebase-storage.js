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

    // Upload file
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true,
      validation: "md5",
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Return public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
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

    // Extract file path from URL
    // URL format: https://storage.googleapis.com/bucket-name/folder/filename.ext
    const urlParts = fileUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

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
