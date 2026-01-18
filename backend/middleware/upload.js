import multer from "multer";

// Use memory storage to handle files as buffers (for Firebase upload)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      ),
      false,
    );
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware for multiple file uploads
export const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);
