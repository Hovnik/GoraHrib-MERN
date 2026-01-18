import express from "express";
import {
  getChecklist,
  addPeakToChecklist,
  removePeakFromChecklist,
  markPeakAsVisited,
  addPicturesToVisitedPeak,
} from "../controllers/checklist.controller.js";
import { authenticate } from "../middleware/auth.js";
import { actionLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadMultiple } from "../middleware/upload.js";

const router = express.Router();

/**
 * Checklist routes (/checklist)
 */
router.get("/", actionLimiter, authenticate, asyncHandler(getChecklist));
router.post(
  "/:peakId",
  actionLimiter,
  authenticate,
  asyncHandler(addPeakToChecklist),
);
router.put(
  "/:peakId/visit",
  actionLimiter,
  authenticate,
  asyncHandler(markPeakAsVisited),
);
router.put(
  "/:peakId/pictures",
  actionLimiter,
  authenticate,
  uploadMultiple("pictures", 3),
  asyncHandler(addPicturesToVisitedPeak),
);
router.delete(
  "/:peakId",
  actionLimiter,
  authenticate,
  asyncHandler(removePeakFromChecklist),
);

export default router;
