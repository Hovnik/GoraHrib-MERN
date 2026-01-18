import User from "../models/User.js";
import Checklist from "../models/Checklist.js";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import {
  uploadToFirebase,
  deleteFromFirebase,
} from "../utils/firebase-storage.js";

// GET /user
export async function getProfileById(req, res) {
  const userId = req.user.id;
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  res.status(StatusCodes.OK).json({ user });
}

// GET /user/:userId - View any user's profile
export async function getUserProfileById(req, res) {
  const { userId } = req.params;

  // Validate userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID format");
  }

  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  res.status(StatusCodes.OK).json({ user });
}

// PUT /user/username
export async function updateUsernameById(req, res) {
  const userId = req.user.id;

  const { value } = req.body;
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestError("Username value is required");
  }

  const username = value.trim();

  // Ensure username is unique (exclude current user)
  const existing = await User.findOne({ username, _id: { $ne: userId } });
  if (existing) {
    throw new BadRequestError("Username already taken");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { username } },
    { new: true, runValidators: true },
  ).select("-passwordHash");

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  res.status(StatusCodes.OK).json({ user: updatedUser });
}

// GET /user/visited
export async function getVisitedPeaksByUserId(req, res) {
  const userId = req.user.id;

  const checklist = await Checklist.find({
    userId,
    status: "Visited",
  }).populate("peakId");
  const visitedPeaks = checklist.map((entry) => entry.peakId);

  res.status(StatusCodes.OK).json({ visitedPeaks });
}

// GET /user/all
export async function getPeaksByUserId(req, res) {
  const userId = req.user.id;
  const checklist = await Checklist.find({ userId }).populate("peakId");
  const peaks = checklist.map((entry) => entry.peakId);

  res.status(StatusCodes.OK).json({ peaks });
}

// GET /user/search
export async function searchUsers(req, res) {
  const { q } = req.query;
  const currentUserId = req.user.id;

  console.log("Search query:", q);
  console.log("Current user ID:", currentUserId);

  if (!q || q.trim().length === 0) {
    return res.status(StatusCodes.OK).json({ users: [] });
  }

  // Search for users by username (case-insensitive)
  const users = await User.find({
    username: { $regex: q, $options: "i" },
    _id: { $ne: currentUserId }, // Exclude current user from results
  })
    .select("username profilePicture friendCount")
    .limit(20);

  console.log("Found users:", users.length);
  console.log(
    "Users:",
    users.map((u) => ({ id: u._id, username: u.username })),
  );

  res.status(StatusCodes.OK).json({ users });
}

// PUT /user/:attribute
export async function updateProfileAttribute(req, res) {
  const userId = req.user.id;
  const attribute = req.params.attribute;
  const allowedAttributes = ["username", "profilePicture"];
  if (!allowedAttributes.includes(attribute)) {
    throw new BadRequestError("Invalid attribute for update");
  }

  const updateData = {};
  updateData[attribute] = req.body.value;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-passwordHash");

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  res.status(StatusCodes.OK).json({ user: updatedUser });
}

// PUT /user/change-password
export async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Current password and new password are required");
  }

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Verify password
  const isPasswordValid = await bcryptjs.compare(
    currentPassword,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid current password");
  }

  // Hash password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(newPassword, salt);

  user.passwordHash = hashedPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ message: "Password changed successfully" });
}

// PUT /user/profile-picture
export async function updateProfilePicture(req, res) {
  const userId = req.user.id;

  // Check if file was uploaded via multipart/form-data
  if (!req.file) {
    throw new BadRequestError("Profile picture file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Delete old profile picture if exists
  if (user.profilePicture?.url) {
    await deleteFromFirebase(user.profilePicture.url);
  }

  // Upload new profile picture to Firebase
  const imageUrl = await uploadToFirebase(
    req.file.buffer,
    req.file.originalname,
    "profile-pictures",
    req.file.mimetype,
  );

  // Get crop data from request body (if provided)
  const crop = req.body.crop
    ? JSON.parse(req.body.crop)
    : { x: 0, y: 0, zoom: 1 };

  const profilePictureData = {
    url: imageUrl,
    crop,
  };

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { profilePicture: profilePictureData } },
    { new: true, runValidators: true },
  ).select("-passwordHash");

  res.status(StatusCodes.OK).json({ user: updatedUser });
}

// DELETE /user/profile-picture
export async function deleteProfilePicture(req, res) {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Delete from Firebase if exists
  if (user.profilePicture?.url) {
    await deleteFromFirebase(user.profilePicture.url);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $unset: { profilePicture: "" } },
    { new: true },
  ).select("-passwordHash");

  res.status(StatusCodes.OK).json({ user: updatedUser });
}
