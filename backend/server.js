import dotenv from "dotenv";

/**
 * Load environment variables from the .env file FIRST
 * Must be before any imports that use process.env
 */
dotenv.config();

import express from "express";
import routes from "./routes/index.js";
import { connectDB } from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import cors from "cors";
import { ApiError } from "./utils/api-error.js";

/**
 * Connect to the database
 */
await connectDB();

/**
 * Create and configure the Express server.
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware to parse JSON requests with increased limit for base64 images
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * Enable CORS for all routes
 */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite default dev server port
    credentials: true,
  })
);

/**
 * Apply rate limiting middleware
 */
app.use(generalLimiter);

/**
 * Mount the main API router
 */
app.use("/api", routes);

/**
 * Error handling middleware - must be after all routes
 */
app.use((err, req, res, next) => {
  // Check if it's an ApiError (our custom error)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // Handle other errors (unexpected errors)
  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
