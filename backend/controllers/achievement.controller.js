import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import { StatusCodes } from "http-status-codes";

// GET /achievements
export async function getAchievements(req, res) {
  const achievements = await Achievement.find().select(
    "title description badge rarity"
  );
  res.status(StatusCodes.OK).json({ achievements });
}

// GET /achievements/users/:id
export async function getUserAchievements(req, res) {
  const userId = req.user.id;
  // Populate achievementId so frontend receives the full achievement object
  const achievements = await UserAchievement.find({ userId }).populate(
    "achievementId",
    "title description badge rarity"
  );
  res.status(StatusCodes.OK).json({ achievements });
}
