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

  let query = {};

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
      f.userId.toString() === userId ? f.friendId : f.userId,
    );

    // Include the user's own ID
    friendIds.push(new mongoose.Types.ObjectId(userId));
    query._id = { $in: friendIds };
  }

  // Fetch users with finishedPeaksCount from their profile
  const users = await User.find(query)
    .select("_id username profilePicture finishedPeaksCount")
    .sort({ finishedPeaksCount: -1 })
    .where("finishedPeaksCount")
    .gt(0)
    .lean();

  // Format response with rank
  const leaderboard = users.map((user, idx) => ({
    rank: idx + 1,
    userId: user._id,
    username: user.username,
    profilePicture: user.profilePicture,
    peaksClimbed: user.finishedPeaksCount || 0,
  }));

  res.status(StatusCodes.OK).json({ leaderboard });
}
