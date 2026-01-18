import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      // Optional: only set for auto-generated achievement posts
    },
    title: {
      type: String,
      required: [true, "Title is required!"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters!"],
    },
    content: {
      type: String,
      required: [true, "Content is required!"],
    },
    category: {
      type: String,
      enum: ["Hike", "Achievement"],
      default: "Hike",
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    pictures: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const ForumPost = mongoose.model("ForumPost", forumPostSchema);

export default ForumPost;
