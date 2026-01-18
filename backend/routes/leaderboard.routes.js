import express from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";
import { generalLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * Leaderboard routes (/leaderboard)
 */
router.get("/", generalLimiter, authenticate, getLeaderboard);

export default router;
