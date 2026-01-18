import express from "express";
import {
  getAchievements,
  getUserAchievements,
} from "../controllers/achievement.controller.js";
import { authenticate } from "../middleware/auth.js";
import { generalLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

/**
 * Achievement routes (/achievements)
 */
router.get("/", generalLimiter, asyncHandler(getAchievements));
router.get(
  "/users",
  generalLimiter,
  authenticate,
  asyncHandler(getUserAchievements)
);

export default router;
