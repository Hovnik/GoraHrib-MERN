import User from "../models/User.js";
import Checklist from "../models/Checklist.js";
import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import Peak from "../models/Peak.js";
import Friend from "../models/Friend.js";
import UserAchievement from "../models/UserAchievement.js";
import { StatusCodes } from "http-status-codes";

// GET /admin/users
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({})
      .select("-passwordHash -verificationToken -verificationTokenExpires")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napaka pri nalaganju uporabnikov",
      error: error.message,
    });
  }
}

// PUT /admin/users/:userId/ban
export async function banUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Uporabnik ni najden",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Ne morete blokirati/odblokirati administratorja",
      });
    }

    // Toggle status
    user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await user.save();

    const message =
      user.status === "INACTIVE"
        ? "Uporabnik je uspešno blokiran"
        : "Uporabnik je uspešno odblokiran";

    res.status(StatusCodes.OK).json({
      message,
      user: {
        id: user._id,
        username: user.username,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napaka pri spremembi statusa uporabnika",
      error: error.message,
    });
  }
}

// DELETE /admin/users/:userId
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Uporabnik ni najden",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Ne morete izbrisati administratorja",
      });
    }

    // Delete user's related data
    await Checklist.deleteMany({ userId: userId });
    await ForumPost.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });
    await Friend.deleteMany({
      $or: [{ userId: userId }, { friendId: userId }],
    });
    await UserAchievement.deleteMany({ userId: userId });

    await User.findByIdAndDelete(userId);

    res.status(StatusCodes.OK).json({
      message: "Uporabnik je uspešno izbrisan",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napaka pri brisanju uporabnika",
      error: error.message,
    });
  }
}

// GET /admin/statistics
export async function getStatistics(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "ACTIVE" });
    const inactiveUsers = await User.countDocuments({ status: "INACTIVE" });
    const totalPeaks = await Peak.countDocuments();
    const totalPosts = await ForumPost.countDocuments();
    const totalComments = await Comment.countDocuments();

    res.status(StatusCodes.OK).json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalPeaks,
      totalPosts,
      totalComments,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napaka pri nalaganju statistike",
      error: error.message,
    });
  }
}
