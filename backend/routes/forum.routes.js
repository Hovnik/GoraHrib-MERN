import express from "express";
import {
  getPostsFromUser,
  getPostsFromFriends,
  getPostDetails,
  getComments,
  createPost,
  addComment,
  toggleLike,
  deletePost,
  deleteComment,
  editComment,
} from "../controllers/forum.controller.js";
import { authenticate } from "../middleware/auth.js";
import { forumLimiter } from "../middleware/rateLimiter.js";
import { uploadMultiple } from "../middleware/upload.js";

const router = express.Router();

/**
 * Forum routes (/forum)
 */
router.get("/", forumLimiter, authenticate, getPostsFromUser);
router.get("/friends", forumLimiter, authenticate, getPostsFromFriends);
router.get("/:postId", forumLimiter, authenticate, getPostDetails);
router.get("/:postId/comments", forumLimiter, authenticate, getComments);

router.post(
  "/",
  forumLimiter,
  authenticate,
  uploadMultiple("pictures", 5),
  createPost,
);
router.post("/:postId/comments", forumLimiter, authenticate, addComment);
router.post("/:postId/like", forumLimiter, authenticate, toggleLike);

router.delete("/:postId", forumLimiter, authenticate, deletePost);
router.delete(
  "/:postId/comments/:commentId",
  forumLimiter,
  authenticate,
  deleteComment,
);

router.put("/comments/:commentId", forumLimiter, authenticate, editComment);

export default router;
