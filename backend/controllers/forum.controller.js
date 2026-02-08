import { StatusCodes } from "http-status-codes";
import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import Friend from "../models/Friend.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import { executeTransaction } from "../utils/transaction-helper.js";
import mongoose from "mongoose";
import {
  uploadToFirebase,
  deleteMultipleFromFirebase,
} from "../utils/firebase-storage.js";

// GET /forum
export async function getPostsFromUser(req, res) {
  try {
    const userId = req.user.id;

    // Fetch posts only from the current user
    const posts = await ForumPost.find({ userId: userId })
      .populate("userId", "username profilePicture")
      .populate("achievementId", "title badge description rarity")
      .populate("peakId", "name elevation")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ posts });
  } catch (error) {
    console.error("Error in getPostsFromUser:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
}

// GET /forum/friends
export async function getPostsFromFriends(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all accepted friendships where the current user is involved
    const friendships = await Friend.find({
      $or: [{ userId: userId }, { friendId: userId }],
      status: "Accepted",
    });

    // Extract friend IDs
    const friendIds = friendships.map((friendship) =>
      friendship.userId.toString() === userId.toString()
        ? friendship.friendId
        : friendship.userId,
    );

    // Include the current user's ID to show their own posts
    const allowedUserIds = [...friendIds, userId];

    // Get total count for pagination
    const totalPosts = await ForumPost.countDocuments({
      userId: { $in: allowedUserIds },
    });

    // Fetch posts only from friends and the current user with pagination
    const posts = await ForumPost.find({ userId: { $in: allowedUserIds } })
      .populate("userId", "username profilePicture")
      .populate("achievementId", "title badge description rarity")
      .populate("peakId", "name elevation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: page * limit < totalPosts,
    });
  } catch (error) {
    console.error("Error in getPostsFromFriends:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
}

// GET /forum/:postId
export async function getPostDetails(req, res) {
  const postId = req.params.postId;
  const post = await ForumPost.findById(postId)
    .populate("userId", "username profilePicture")
    .populate("achievementId", "title badge description rarity")
    .populate("peakId", "name elevation");
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Post not found" });
  }
  res.status(StatusCodes.OK).json({ postId, post });
}

// GET /forum/:postId/comments
export async function getComments(req, res) {
  const postId = req.params.postId;

  const comments = await Comment.find({ postId })
    .populate("userId", "username profilePicture")
    .sort({ createdAt: 1 });
  if (!comments) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Post doesnt have comments" });
  }

  res.status(StatusCodes.OK).json({ postId, comments: comments || [] });
}

// POST /forum
export async function createPost(req, res) {
  const userId = req.user.id;
  const { title, content, category, pictures, peakId } = req.body;

  if (!title) {
    throw new BadRequestError("Post title is required");
  }

  if (!content) {
    throw new BadRequestError("Post content is required");
  }

  if (category && !["Hike", "Achievement"].includes(category)) {
    throw new BadRequestError("Invalid category");
  }

  // Handle pictures from two sources:
  // 1. New file uploads (req.files) - upload to Firebase
  // 2. Existing URLs (req.body.pictures) - when sharing from visited peaks
  let pictureUrls = [];

  // Handle new file uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToFirebase(
        file.buffer,
        file.originalname,
        "hiking-pictures",
        file.mimetype,
      ),
    );
    pictureUrls = await Promise.all(uploadPromises);
  }

  // Handle existing Firebase URLs (from peak pictures)
  if (pictures && Array.isArray(pictures) && pictures.length > 0) {
    // Validate that they are strings (URLs)
    const validUrls = pictures.filter(
      (url) => typeof url === "string" && url.startsWith("https://"),
    );
    pictureUrls = [...pictureUrls, ...validUrls];
  }

  const newPost = {
    userId: userId,
    title: title,
    content: content,
    category: category,
    pictures: pictureUrls,
  };

  // Add peakId if provided
  if (peakId) {
    newPost.peakId = peakId;
  }

  const createdPost = await ForumPost.create(newPost);
  const populatedPost = await ForumPost.findById(createdPost._id)
    .populate("userId", "username profilePicture")
    .populate("achievementId", "title badge description rarity")
    .populate("peakId", "name elevation");

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Post created", post: populatedPost });
}

// POST /forum/:postId/comments
export async function addComment(req, res) {
  const postId = req.params.postId;
  // const userId = req.params.id;
  const userId = req.user.id;

  const { content } = req.body;

  if (!content) {
    throw new BadRequestError("Comment content is required");
  }

  const newComment = {
    postId: postId,
    userId: userId,
    content: content,
  };

  const createdComment = await Comment.create(newComment);
  await ForumPost.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

  res.json({
    message: `Comment added to post ${postId}`,
    comment: createdComment,
  });
}

// POST /forum/:postId/like
export async function toggleLike(req, res) {
  const postId = req.params.postId;
  // const userId = req.params.id;
  const userId = req.user.id;

  const hasLiked = await executeTransaction(async (session) => {
    const post = await ForumPost.findById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const hasLiked = post.likedBy.includes(userId);

    if (hasLiked) {
      await ForumPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: -1 }, $pull: { likedBy: userId } },
        { new: true },
      );
    } else {
      await ForumPost.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 }, $addToSet: { likedBy: userId } },
        { new: true },
      );
    }

    await session.commitTransaction();
    return hasLiked;
  });

  res.status(StatusCodes.OK).json({ like: !hasLiked });
}

// DELETE /forum/:postId
export async function deletePost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;

  const post = await ForumPost.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  // Prevent deletion of auto-generated achievement posts
  if (post.achievementId) {
    throw new BadRequestError("Achievement posts cannot be manually deleted");
  }

  // Ensure user owns the post
  if (post.userId.toString() !== userId.toString()) {
    throw new BadRequestError("You can only delete your own posts");
  }

  // Delete pictures from Firebase if they exist
  if (post.pictures && post.pictures.length > 0) {
    await deleteMultipleFromFirebase(post.pictures);
  }

  await executeTransaction(async (session) => {
    await ForumPost.deleteOne({ _id: postId }, { session });
    await Comment.deleteMany({ postId: postId }, { session });
    await session.commitTransaction();
  });

  res
    .status(StatusCodes.OK)
    .json({ message: `Post ${postId} and its comments deleted` });
}

// DELETE /forum/:postId/comments/:commentId
export async function deleteComment(req, res) {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const postExists = await ForumPost.exists({ _id: postId });
  if (!postExists) {
    throw new NotFoundError("Post not found");
  }

  const commentExists = await Comment.exists({
    _id: commentId,
    postId: postId,
  });
  if (!commentExists) {
    throw new NotFoundError("Comment not found for this post");
  }

  await executeTransaction(async (session) => {
    await Comment.deleteOne({ _id: commentId }, { session });
    await ForumPost.updateOne(
      { _id: postId },
      { $inc: { commentCount: -1 } },
      { session },
    );
  });

  res.status(StatusCodes.OK).json({ message: `Comment ${commentId} deleted` });
}

// PUT /forum/:postId/comments/:commentId
export async function editComment(req, res) {
  const commentId = req.params.commentId;
  const postId = req.params.postId;
  const { content } = req.body;

  if (!content) {
    throw new BadRequestError("Comment content is required");
  }

  if (!(await ForumPost.exists({ _id: postId }))) {
    throw new NotFoundError("Post not found");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  await Comment.updateOne({ _id: commentId }, { $set: { content: content } });
  // Logic to edit a specific comment
  res.status(StatusCodes.OK).json({ message: `Comment ${commentId} edited` });
}
