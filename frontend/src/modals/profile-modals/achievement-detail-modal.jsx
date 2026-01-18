const AchievementDetailModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  const rarityColors = {
    Common: "badge-neutral",
    Uncommon: "badge-success",
    Rare: "badge-info",
    Epic: "badge-secondary",
    Legendary: "badge-warning",
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="text-center">
          <div className="text-6xl mb-4">{achievement.icon}</div>
          <h3 className="font-bold text-2xl mb-2">{achievement.name}</h3>
          {achievement.rarity && (
            <div className="mb-3">
              <span
                className={`badge ${
                  rarityColors[achievement.rarity] || "badge-neutral"
                }`}
              >
                {achievement.rarity}
              </span>
            </div>
          )}
          <p className="text-gray-600 mb-4">{achievement.description}</p>
          <p className="text-sm text-gray-500">
            Doseženo: {achievement.dateEarned}
          </p>
        </div>
        <div className="modal-action justify-center">
          <button onClick={onClose} className="btn">
            Zapri
          </button>
        </div>
      </div>
    </div>
  );
};
export default AchievementDetailModal;
