import express from "express";
import {
  getAllUsers,
  banUser,
  deleteUser,
  getStatistics,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/admin.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

/**
 * Admin routes (/admin)
 */
router.get("/users", authenticate, isAdmin, asyncHandler(getAllUsers));
router.put("/users/:userId/ban", authenticate, isAdmin, asyncHandler(banUser));
router.delete(
  "/users/:userId",
  authenticate,
  isAdmin,
  asyncHandler(deleteUser)
);
router.get("/statistics", authenticate, isAdmin, asyncHandler(getStatistics));

export default router;
