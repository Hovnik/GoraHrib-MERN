import { useState, useEffect } from "react";
import AchievementDetailModal from "../../modals/profile-modals/achievement-detail-modal";
import axios from "axios";
import { Lock, Mountain } from "lucide-react";

const ProfileAchievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  // Rarity order for sorting (highest to lowest)
  const rarityOrder = {
    Legendary: 1,
    Epic: 2,
    Rare: 3,
    Uncommon: 4,
    Common: 5,
  };

  // Get rarity-based styling
  const getRarityStyles = (rarity, unlocked) => {
    const styles = {
      Legendary: unlocked
        ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
        : "border-2 border-yellow-300/40 bg-gradient-to-br from-yellow-50/30 to-orange-50/30",
      Epic: unlocked
        ? "border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50"
        : "border-2 border-purple-300/40 bg-gradient-to-br from-purple-50/30 to-pink-50/30",
      Rare: unlocked
        ? "border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50"
        : "border-2 border-blue-300/40 bg-gradient-to-br from-blue-50/30 to-cyan-50/30",
      Uncommon: unlocked
        ? "border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
        : "border-2 border-green-300/40 bg-gradient-to-br from-green-50/30 to-emerald-50/30",
      Common: unlocked
        ? "border-2 border-gray-300 bg-base-100"
        : "border-2 border-gray-200/40 bg-base-100/30",
    };
    return styles[rarity] || styles.Common;
  };

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);

        // Fetch all achievements
        const allAchievementsResponse = await axios.get(
          "http://localhost:3000/api/achievement"
        );
        const allAchievements = allAchievementsResponse.data.achievements;

        // Fetch user's unlocked achievements
        const token = localStorage.getItem("token");
        const userAchievementsResponse = await axios.get(
          "http://localhost:3000/api/achievement/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userAchievementsData = userAchievementsResponse.data.achievements;

        // Create a map of unlocked achievement IDs with their unlock dates
        const unlockedMap = {};
        userAchievementsData.forEach((ua) => {
          if (ua.achievementId && ua.achievementId._id) {
            unlockedMap[ua.achievementId._id] = ua.unlockedAt;
          }
        });

        // Merge all achievements with user's unlock status
        const mergedAchievements = allAchievements.map((achievement) => {
          const unlockedAt = unlockedMap[achievement._id];
          return {
            id: achievement._id,
            name: achievement.title,
            description: achievement.description,
            icon: achievement.badge,
            rarity: achievement.rarity,
            unlocked: !!unlockedAt,
            dateEarned: unlockedAt
              ? new Date(unlockedAt).toLocaleDateString("sl-SI", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null,
          };
        });

        // Sort by rarity (highest to lowest)
        mergedAchievements.sort((a, b) => {
          const rarityDiff =
            (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
          if (rarityDiff !== 0) return rarityDiff;
          // If same rarity, unlocked achievements come first
          return b.unlocked - a.unlocked;
        });

        setAchievements(mergedAchievements);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setLoading(false);
      }
    };

    fetchAchievements();

    // Listen for achievement updates
    const handleAchievementUpdate = () => {
      fetchAchievements();
    };

    window.addEventListener("achievementsUpdated", handleAchievementUpdate);

    return () => {
      window.removeEventListener(
        "achievementsUpdated",
        handleAchievementUpdate
      );
    };
  }, []);

  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const handleAchievementClick = (achievement) => {
    if (achievement.unlocked) {
      setSelectedAchievement(achievement);
    }
  };

  if (loading) {
    return (
      <div className="px-2 pt-4 flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="px-2 pt-4 flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">Ni dosežkov.</p>
      </div>
    );
  }

  return (
    <div className="px-2">
      {/* Achievements Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Moje objave</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className={`card shadow-md ${getRarityStyles(
                achievement.rarity,
                achievement.unlocked
              )} ${
                achievement.unlocked
                  ? "cursor-pointer hover:shadow-lg transition-shadow"
                  : "opacity-60"
              }`}
            >
              <div className="card-body p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-2">
                  {achievement.unlocked ? (
                    <span className="text-4xl">🏔️</span>
                  ) : (
                    <div className="relative flex justify-center">
                      <Mountain className="w-10 h-10 text-gray-300" />
                      <Lock className="w-6 h-6 text-gray-500 absolute -bottom-1 -right-1" />
                    </div>
                  )}
                </div>

                {achievement.unlocked && (
                  <p className="text-sm font-semibold">{achievement.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AchievementDetailModal
        isOpen={selectedAchievement}
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};

export default ProfileAchievements;
