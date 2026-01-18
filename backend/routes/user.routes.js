import express from "express";
import {
  getProfileById,
  getUserProfileById,
  updateUsernameById,
  getVisitedPeaksByUserId,
  getPeaksByUserId,
  searchUsers,
  changePassword,
  updateProfilePicture,
  deleteProfilePicture,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { generalLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

/**
 * User routes (/user)
 */
router.get("/", generalLimiter, authenticate, asyncHandler(getProfileById));
router.get("/search", generalLimiter, authenticate, asyncHandler(searchUsers));
router.get(
  "/visited",
  generalLimiter,
  authenticate,
  asyncHandler(getVisitedPeaksByUserId),
);
router.get(
  "/all",
  generalLimiter,
  authenticate,
  asyncHandler(getPeaksByUserId),
);
router.get(
  "/:userId",
  generalLimiter,
  authenticate,
  asyncHandler(getUserProfileById),
);
router.put(
  "/username",
  generalLimiter,
  authenticate,
  asyncHandler(updateUsernameById),
);
router.put(
  "/profile-picture",
  generalLimiter,
  authenticate,
  uploadSingle("profilePicture"),
  asyncHandler(updateProfilePicture),
);
router.delete(
  "/profile-picture",
  generalLimiter,
  authenticate,
  asyncHandler(deleteProfilePicture),
);
router.put(
  "/change-password",
  generalLimiter,
  authenticate,
  asyncHandler(changePassword),
);

export default router;
