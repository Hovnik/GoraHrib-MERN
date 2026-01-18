import mongoose from "mongoose";
import User from "../models/User.js";
import Checklist from "../models/Checklist.js";
import Friend from "../models/Friend.js";
import { BadRequestError } from "../utils/api-error.js";
import { StatusCodes } from "http-status-codes";

// GET /leaderboard
export async function getLeaderboard(req, res) {
  const userId = req.user.id;
  const leaderboardType = req.query.type || "Global";

  if (!["Global", "Friends"].includes(leaderboardType)) {
    throw new BadRequestError("Invalid leaderboard type");
  }

  let userIds = [];

  if (leaderboardType === "Friends") {
    // Fetch friends' IDs
    const friends = await Friend.find({
      $or: [{ userId }, { friendId: userId }],
      status: "Accepted",
    });

    if (friends.length === 0) {
      return res
        .status(StatusCodes.OK)
        .json({ leaderboard: [], message: "No friends found" });
    }

    const friendIds = friends.map((f) =>
      f.userId.toString() === userId ? f.friendId : f.userId
    );

    // Include the user's own ID (convert to ObjectId for type consistency)
    friendIds.push(new mongoose.Types.ObjectId(userId));
    userIds = friendIds;
  } else {
    // For global: fetch all users
    const allUsers = await User.find({}).select("_id");
    userIds = allUsers.map((u) => u._id);
  }

  // Aggregate visited peaks count per user from Checklist
  const leaderboardData = await Checklist.aggregate([
    {
      $match: {
        userId: { $in: userIds },
        status: "Visited",
      },
    },
    {
      $group: {
        _id: "$userId",
        peaksClimbed: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $project: {
        _id: 1,
        peaksClimbed: 1,
        username: "$userInfo.username",
        profilePicture: "$userInfo.profilePicture",
      },
    },
    {
      $sort: { peaksClimbed: -1 },
    },
  ]);

  // Format response with rank
  const leaderboard = leaderboardData.map((entry, idx) => ({
    rank: idx + 1,
    userId: entry._id,
    username: entry.username,
    profilePicture: entry.profilePicture,
    peaksClimbed: entry.peaksClimbed,
  }));

  res.status(StatusCodes.OK).json({ leaderboard });
}
