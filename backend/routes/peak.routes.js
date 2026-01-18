import express from "express";
import {
  getPeaks,
  getPeakDetails,
  searchPeaks,
} from "../controllers/peak.controller.js";
import { generalLimiter, searchLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * Peak routes (/peaks)
 */
router.get("/", generalLimiter, getPeaks);
router.get("/:id", generalLimiter, getPeakDetails);
router.get("/search", searchLimiter, searchPeaks);

export default router;
