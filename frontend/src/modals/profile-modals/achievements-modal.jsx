import { X } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../config/axios";
import AchievementDetailModal from "./achievement-detail-modal";
import { Lock, Mountain } from "lucide-react";

const AchievementsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Rarity order for sorting (highest to lowest)
  const rarityOrder = {
    Legendary: 5,
    Epic: 4,
    Rare: 3,
    Uncommon: 2,
    Common: 1,
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
    if (isOpen) {
      const fetchAchievements = async () => {
        try {
          setLoading(true);
          const allAchievementsResponse = await api.get(
            "/api/achievement"
          );
          const allAchievements = allAchievementsResponse.data.achievements;

          const token = localStorage.getItem("token");
          const userAchievementsResponse = await api.get(
            "/api/achievement/users",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const userAchievementsData =
            userAchievementsResponse.data.achievements;

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
              (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
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
    }
  }, [isOpen]);

  const handleAchievementClick = (achievement) => {
    if (achievement.unlocked) {
      setSelectedAchievement(achievement);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">Vsi Dosežki</h3>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    onClick={() => handleAchievementClick(achievement)}
                    className={`card ${getRarityStyles(
                      achievement.rarity,
                      achievement.unlocked
                    )} ${
                      achievement.unlocked
                        ? "cursor-poter transition-shadow"
                        : "opacity-60"
                    }`}
                  >
                    <div className="card-body p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2">
                        {achievement.unlocked ? (
                          <span className="text-4xl">{achievement.icon}</span>
                        ) : (
                          <div className="relative flex justify-center">
                            <Mountain className="w-10 h-10 text-gray-300" />
                            <Lock className="w-6 h-6 text-gray-500 absolute -bottom-1 -right-1" />
                          </div>
                        )}
                      </div>

                      {achievement.unlocked && (
                        <p className="text-sm font-semibold">
                          {achievement.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  );
};

export default AchievementsModal;
