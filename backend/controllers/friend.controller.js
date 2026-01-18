import { StatusCodes } from "http-status-codes";
import Friend from "../models/Friend.js";
import Checklist from "../models/Checklist.js";
import UserAchievement from "../models/UserAchievement.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { executeTransaction } from "../utils/transaction-helper.js";

// GET /friends
export async function getFriends(req, res) {
  const userId = req.user.id;
  const status = req.query.status;

  const allowedStatuses = ["Accepted", "Pending"];
  let query;

  if (status === "Pending") {
    // For pending requests, only show incoming requests (where user is receiver)
    query = { friendId: userId, status: "Pending" };
  } else {
    // For accepted friends, show all accepted friendships where user is involved
    query = {
      $or: [{ userId }, { friendId: userId }],
      ...(status ? { status } : {}),
    };
  }

  const friends = await Friend.find(query)
    .populate("userId", "username profilePicture")
    .populate("friendId", "username profilePicture");

  // Transform the data to return the other user in the friendship
  const transformedFriends = friends.map((friend) => {
    const isUserSender = friend.userId._id.toString() === userId;
    const otherUser = isUserSender ? friend.friendId : friend.userId;

    return {
      _id: friend._id,
      status: friend.status,
      requestedAt: friend.requestedAt,
      acceptedAt: friend.acceptedAt,
      user: otherUser, // The other user in the friendship
    };
  });

  res.status(StatusCodes.OK).json({ friends: transformedFriends });
}

// GET /friends/:userId
export async function getFriendProfile(req, res) {
  const userId = req.user.id;
  const friendId = req.params.userId;

  // Validate friendId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new BadRequestError("Invalid user ID format");
  }

  // Verify friendship exists and is accepted
  const friendship = await Friend.findOne({
    $or: [
      { userId: userId, friendId: friendId },
      { userId: friendId, friendId: userId },
    ],
    status: "Accepted",
  });

  if (!friendship) {
    throw new NotFoundError("Friendship not found or not accepted");
  }

  // Fetch friend's achievements
  const achievements = await UserAchievement.find({ userId: friendId })
    .populate("achievementId", "title description badge rarity")
    .select("achievementId unlockedAt");

  // Fetch friend's visited peaks
  const visitedPeaks = await Checklist.find({
    userId: friendId,
    status: "Visited",
  })
    .populate("peakId", "name elevation")
    .select("peakId visitedDate");

  // Fetch friend's full checklist (just Wishlist)
  const checklistPeaks = await Checklist.find({
    userId: friendId,
    status: "Wishlist",
  })
    .populate("peakId", "name elevation")
    .select("peakId status visitedDate");

  // Fetch friend's friends
  const friendsFriendships = await Friend.find({
    $or: [{ userId: friendId }, { friendId: friendId }],
    status: "Accepted",
  })
    .populate("userId", "username profilePicture")
    .populate("friendId", "username profilePicture");

  // Transform friends data to return the other user
  const friends = friendsFriendships.map((f) => {
    const isUserSender = f.userId._id.toString() === friendId;
    const otherUser = isUserSender ? f.friendId : f.userId;
    return {
      _id: f._id,
      user: otherUser,
      acceptedAt: f.acceptedAt,
    };
  });

  res.status(StatusCodes.OK).json({
    achievements,
    visitedPeaks,
    checklistPeaks,
    friends,
  });
}

// POST /friends/:userId
export async function sendFriendRequest(req, res) {
  const friendId = req.params.userId;
  const userId = req.user.id;

  // Validate friendId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new BadRequestError("Invalid user ID format");
  }

  await Friend.create({ userId, friendId });

  res.json({ message: `Friend request sent to user ${friendId}` });
}

// PUT /friends/accept/:friendId
export async function acceptFriendRequest(req, res) {
  const friendshipId = req.params.friendId;
  const userId = req.user.id;

  // Find the friendship by its ID
  const friendship = await Friend.findById(friendshipId);

  if (!friendship) {
    throw new NotFoundError("Friend request not found");
  }

  // Verify that the current user is the receiver of this request
  if (friendship.friendId.toString() !== userId) {
    throw new NotFoundError("Friend request not found");
  }

  // Verify the request is still pending
  if (friendship.status !== "Pending") {
    throw new BadRequestError("Friend request has already been processed");
  }

  const senderId = friendship.userId.toString();

  await executeTransaction(async (session) => {
    await Friend.findByIdAndUpdate(
      friendshipId,
      { $set: { status: "Accepted", acceptedAt: new Date() } },
      { new: true }
    ).session(session);
    await User.findByIdAndUpdate(userId, {
      $inc: { friendsCount: 1 },
    }).session(session);
    await User.findByIdAndUpdate(senderId, {
      $inc: { friendsCount: 1 },
    }).session(session);
  });

  res.json({ message: `Friend request accepted` });
}

// DELETE /friends/request/:friendId
export async function rejectFriendRequest(req, res) {
  const friendshipId = req.params.friendId;
  const userId = req.user.id;

  // Find the friendship by its ID
  const friendship = await Friend.findById(friendshipId);

  if (!friendship) {
    throw new NotFoundError("Friend request not found");
  }

  // Verify that the current user is the receiver of this request
  if (friendship.friendId.toString() !== userId) {
    console.log(
      "User is not the receiver. friendship.friendId:",
      friendship.friendId.toString(),
      "userId:",
      userId
    );
    throw new NotFoundError("Friend request not found");
  }

  // Verify the request is still pending
  if (friendship.status !== "Pending") {
    throw new BadRequestError("Friend request has already been processed");
  }

  await Friend.findByIdAndDelete(friendshipId);

  res.json({ message: `Friend request rejected` });
}

// DELETE /friends/:friendId
export async function removeFriend(req, res) {
  const friendshipId = req.params.friendId;
  const userId = req.user.id;

  // Find the friendship by its ID
  const friendship = await Friend.findById(friendshipId);

  if (!friendship) {
    throw new NotFoundError("Friend not found");
  }

  const friendId = friendship.userId.toString();

  await executeTransaction(async (session) => {
    await Friend.findByIdAndDelete(friendshipId).session(session);
    await User.findByIdAndUpdate(userId, {
      $inc: { friendsCount: -1 },
    }).session(session);
    await User.findByIdAndUpdate(friendId, {
      $inc: { friendsCount: -1 },
    }).session(session);
  });

  res.status(StatusCodes.OK).json({ message: `Friend ${friendId} removed` });
}

// GET /friends/peaks-visited
export async function getFriendsPeaksVisited(req, res) {
  const userId = req.user.id;

  // Get all accepted friends
  const friendships = await Friend.find({
    $or: [{ userId }, { friendId: userId }],
    status: "Accepted",
  });

  // Extract friend IDs
  const friendIds = friendships.map((friendship) => {
    return friendship.userId.toString() === userId
      ? friendship.friendId
      : friendship.userId;
  });

  // Get all visited peaks and checklist items for these friends
  const [visitedItems, checklistItems] = await Promise.all([
    Checklist.find({
      userId: { $in: friendIds },
      status: "Visited",
    }).populate("userId", "username profilePicture"),
    Checklist.find({
      userId: { $in: friendIds },
    }).populate("userId", "username profilePicture"),
  ]);

  // Organize by peakId
  const peakData = {};

  visitedItems.forEach((item) => {
    const peakId = item.peakId.toString();
    if (!peakData[peakId]) {
      peakData[peakId] = { visited: [], inChecklist: [] };
    }
    peakData[peakId].visited.push({
      userId: item.userId._id,
      username: item.userId.username,
      profilePicture: item.userId.profilePicture,
    });
  });

  checklistItems.forEach((item) => {
    const peakId = item.peakId.toString();
    if (!peakData[peakId]) {
      peakData[peakId] = { visited: [], inChecklist: [] };
    }
    // Only add to checklist if not already in visited
    const alreadyVisited = peakData[peakId].visited.some(
      (v) => v.userId.toString() === item.userId._id.toString()
    );
    if (!alreadyVisited) {
      peakData[peakId].inChecklist.push({
        userId: item.userId._id,
        username: item.userId.username,
        profilePicture: item.userId.profilePicture,
      });
    }
  });

  res.status(StatusCodes.OK).json({ peakData });
}
