import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: [true, "Achievement ID is required!"],
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserAchievement = mongoose.model(
  "UserAchievement",
  userAchievementSchema
);

export default UserAchievement;
