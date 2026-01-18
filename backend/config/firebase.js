import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account key from environment or file
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // If service account is provided as environment variable (for production)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Load from file (for development)
  // You'll need to download this from Firebase Console
  // Project Settings -> Service Accounts -> Generate New Private Key
  try {
    const serviceAccountPath = path.join(
      __dirname,
      "../firebase-service-account.json",
    );
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  } catch (error) {
    console.warn(
      "Firebase service account file not found. Please add firebase-service-account.json to backend folder or set FIREBASE_SERVICE_ACCOUNT environment variable.",
    );
  }
}

// Initialize Firebase Admin SDK
if (serviceAccount) {
  try {
    const storageBucket =
      process.env.FIREBASE_STORAGE_BUCKET ||
      serviceAccount.project_id + ".appspot.com";

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
    console.log("Firebase Admin SDK initialized successfully");
    console.log("Storage bucket:", storageBucket);
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error.message);
  }
} else {
  console.warn("Firebase Admin SDK not initialized - service account missing");
}

export const bucket = admin.storage().bucket();
export default admin;
