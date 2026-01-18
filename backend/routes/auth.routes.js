import express from "express";
import {
  login,
  register,
  verifyEmail,
  sendNewPassword,
} from "../controllers/auth.controller.js";
import { resendVerification } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

/**
 * Auth routes (/auth)
 */
router.post("/login", authLimiter, asyncHandler(login));
router.post("/register", authLimiter, asyncHandler(register));
router.post(
  "/resend-verification",
  authLimiter,
  asyncHandler(resendVerification)
);
router.get("/verify-email/:token", authLimiter, asyncHandler(verifyEmail));
router.post("/forgot-password", authLimiter, asyncHandler(sendNewPassword));

export default router;
