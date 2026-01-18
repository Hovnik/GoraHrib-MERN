import express from "express";
import {
  getFriends,
  sendFriendRequest,
  removeFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsPeaksVisited,
  getFriendProfile,
} from "../controllers/friend.controller.js";
import { authenticate } from "../middleware/auth.js";
import { generalLimiter, friendLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

/**
 * Friend routes (/friends)
 */
router.get("/", generalLimiter, authenticate, asyncHandler(getFriends));
router.get(
  "/peaks-visited",
  generalLimiter,
  authenticate,
  asyncHandler(getFriendsPeaksVisited)
);
router.get(
  "/:userId",
  generalLimiter,
  authenticate,
  asyncHandler(getFriendProfile)
);
router.post(
  "/:userId",
  friendLimiter,
  authenticate,
  asyncHandler(sendFriendRequest)
);
router.put(
  "/accept/:friendId",
  friendLimiter,
  authenticate,
  asyncHandler(acceptFriendRequest)
);
router.delete(
  "/request/:friendId",
  friendLimiter,
  authenticate,
  asyncHandler(rejectFriendRequest)
);
router.delete(
  "/:friendId",
  generalLimiter,
  authenticate,
  asyncHandler(removeFriend)
);

export default router;
