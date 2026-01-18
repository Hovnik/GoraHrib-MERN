import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import achivementRoutes from "./achievement.routes.js";
import checklistRoutes from "./checklist.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";
import peakRoutes from "./peak.routes.js";
import forumRutes from "./forum.routes.js";
import friendRoutes from "./friend.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

/**
 * Authentication routes
 */
router.use("/auth", authRoutes);

/**
 * User routes
 */
router.use("/user", userRoutes);

/**
 * Achievement routes
 */
router.use("/achievement", achivementRoutes);

/**
 * Checklist routes
 */
router.use("/checklist", checklistRoutes);

/**
 * Leaderboard routes
 */
router.use("/leaderboard", leaderboardRoutes);

/**
 * Mountain routes
 */
router.use("/peaks", peakRoutes);

/**
 * Notification routes
 */
router.use("/forum", forumRutes);

/**
 * Friend routes
 */
router.use("/friends", friendRoutes);

/**
 * Admin routes
 */
router.use("/admin", adminRoutes);

export default router;
