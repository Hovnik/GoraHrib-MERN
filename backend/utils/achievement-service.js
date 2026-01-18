import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import User from "../models/User.js";
import Checklist from "../models/Checklist.js";
import Peak from "../models/Peak.js";
import ForumPost from "../models/ForumPost.js";

/**
 * Create an automatic forum post when user unlocks an achievement
 * @param {string} userId - The user ID
 * @param {Object} achievement - The achievement object
 * @param {mongoose.ClientSession} session - Database transaction session
 */
async function createAchievementPost(userId, achievement, session = null) {
  try {
    const user = await User.findById(userId).session(session);
    if (!user) return;

    const newPost = {
      userId,
      achievementId: achievement._id,
      title: "Ravnokar sem dosegel/a nov dosežek!",
      content: `${achievement.title} - ${achievement.description}`,
      category: "Achievement",
    };

    await ForumPost.create([newPost], { session });
    console.log(
      `Created achievement post for user ${userId}, achievement: ${achievement.title}`
    );
  } catch (error) {
    console.error("Error creating achievement post:", error);
    // Don't throw - we don't want to fail the transaction if post creation fails
  }
}

/**
 * Check and award achievements for a user based on their current stats
 * @param {string} userId - The user ID to check achievements for
 * @param {mongoose.ClientSession} session - Database transaction session
 */
export async function checkAndAwardAchievements(userId, session = null) {
  try {
    // Get user stats
    const user = await User.findById(userId).session(session);
    if (!user) return;

    // Get user's visited peaks count
    const visitedPeaksCount = user.finishedPeaksCount;

    // Get all achievements
    const achievements = await Achievement.find().session(session);

    // Get user's existing achievements
    const userAchievements = await UserAchievement.find({ userId })
      .populate("achievementId")
      .session(session);

    const existingAchievementIds = userAchievements.map((ua) =>
      ua.achievementId._id.toString()
    );

    // Check each achievement
    const newAchievements = [];

    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (existingAchievementIds.includes(achievement._id.toString())) {
        continue;
      }

      let shouldAward = false;

      // Parse criteria to determine if achievement should be awarded
      const criteria = achievement.criteria.toLowerCase();

      if (criteria.includes("obišči") && criteria.includes("vrh")) {
        // Extract number from criteria like "Obišči 5 vrhov" or "Obišči 1 vrh"
        // Matches both singular (vrh) and plural (vrhov)
        const match = criteria.match(/obišči (\d+) vrho?v?/);
        if (match) {
          const requiredCount = parseInt(match[1]);
          if (visitedPeaksCount >= requiredCount) {
            shouldAward = true;
          }
        }
      }

      if (criteria.includes("triglav")) {
        // Award if the user has visited the peak named Triglav
        const peakObj = await Peak.findOne({
          name: { $regex: /^triglav$/i },
        }).session(session);
        if (peakObj) {
          const visited = await Checklist.findOne({
            userId,
            peakId: peakObj._id,
            status: "Visited",
          }).session(session);
          if (visited) {
            shouldAward = true;
          }
        }
      }

      // Add more criteria checks here as needed
      // For example: specific mountain ranges, consecutive days, etc.

      if (shouldAward) {
        newAchievements.push(achievement);
      }
    }

    // Award new achievements
    if (newAchievements.length > 0) {
      const achievementInserts = newAchievements.map((achievement) => ({
        userId,
        achievementId: achievement._id,
        unlockedAt: new Date(),
      }));

      await UserAchievement.insertMany(achievementInserts, { session });

      // Update user's achievement count
      await User.updateOne(
        { _id: userId },
        { $inc: { achievementsCount: newAchievements.length } },
        { session }
      );

      // Create forum posts for each new achievement
      for (const achievement of newAchievements) {
        await createAchievementPost(userId, achievement, session);
      }

      console.log(
        `Awarded ${newAchievements.length} achievements to user ${userId}`
      );
    }

    return newAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    throw error;
  }
}

/**
 * Get user's achievements with populated achievement details
 * @param {string} userId - The user ID
 * @returns {Array} User's achievements with details
 */
export async function getUserAchievements(userId) {
  try {
    const userAchievements = await UserAchievement.find({ userId })
      .populate("achievementId")
      .sort({ unlockedAt: -1 });

    return userAchievements.map((ua) => ({
      id: ua._id,
      title: ua.achievementId.title,
      description: ua.achievementId.description,
      badge: ua.achievementId.badge,
      criteria: ua.achievementId.criteria,
      rarity: ua.achievementId.rarity,
      unlockedAt: ua.unlockedAt,
    }));
  } catch (error) {
    console.error("Error getting user achievements:", error);
    throw error;
  }
}

/**
 * Revoke achievements that no longer meet criteria after a user's stats decreased
 * Specifically handles "Obišči X vrhov" achievements when finishedPeaksCount is reduced
 * @param {string} userId
 * @param {mongoose.ClientSession} session
 */
export async function revokeAchievementsIfNeeded(userId, session = null) {
  try {
    const user = await User.findById(userId).session(session);
    if (!user) return [];

    const visitedPeaksCount = user.finishedPeaksCount;

    // Find achievements with criteria like "Obišči N vrhov"
    const achievements = await Achievement.find().session(session);

    const achievementsToRevoke = [];

    for (const achievement of achievements) {
      const criteria = (achievement.criteria || "").toLowerCase();

      // Numeric "Obišči N vrhov" achievements
      const match = criteria.match(/obišči (\d+) vrho?v?/);
      if (match) {
        const requiredCount = parseInt(match[1]);
        if (visitedPeaksCount < requiredCount) {
          achievementsToRevoke.push(achievement._id);
        }
        continue;
      }

      // Specific peak achievements (e.g., "Obišči Triglav")
      if (criteria.includes("triglav")) {
        const peakObj = await Peak.findOne({
          name: { $regex: /^triglav$/i },
        }).session(session);
        // If the peak exists but the user no longer has it marked as visited, revoke
        if (peakObj) {
          const stillVisited = await Checklist.findOne({
            userId,
            peakId: peakObj._id,
            status: "Visited",
          }).session(session);
          if (!stillVisited) {
            achievementsToRevoke.push(achievement._id);
          }
        }
      }
    }

    if (achievementsToRevoke.length === 0) return [];

    // Find user's matching UserAchievement docs and populate achievement details
    const userAchievements = await UserAchievement.find({
      userId,
      achievementId: { $in: achievementsToRevoke },
    })
      .populate("achievementId")
      .session(session);

    if (userAchievements.length === 0) return [];

    const idsToRemove = userAchievements.map((ua) => ua._id);
    const achievementIdsToRemove = userAchievements.map(
      (ua) => ua.achievementId._id
    );

    // Remove them
    await UserAchievement.deleteMany({ _id: { $in: idsToRemove } }).session(
      session
    );

    // Delete corresponding forum posts
    await ForumPost.deleteMany({
      userId,
      achievementId: { $in: achievementIdsToRemove },
    }).session(session);

    // Decrement user's achievementsCount
    await User.updateOne(
      { _id: userId },
      { $inc: { achievementsCount: -userAchievements.length } },
      { session }
    );

    console.log(
      `Revoked ${userAchievements.length} achievements and deleted corresponding forum posts for user ${userId}`
    );

    return userAchievements.map((ua) => ua.achievementId);
  } catch (error) {
    console.error("Error revoking achievements:", error);
    throw error;
  }
}
