import { divIcon } from "leaflet";
import L from "leaflet";

// Component to create friend avatars overlay for a peak marker
export const createFriendAvatarsIcon = (
  friends,
  baseIcon,
  hideAvatars = false
) => {
  // Always return a divIcon so the DOM structure stays consistent
  // `hideAvatars` can be used to render only the base dot (used when popup is open)

  const avatarSize = 60;
  const arcRadius = 55; // radius of the arc
  const arcAngle = 60; // total arc span in degrees

  // Show max 3 avatars + count badge if 4+
  const showAvatars = !hideAvatars && friends && friends.length > 0;
  const displayCount = showAvatars ? Math.min(friends.length, 3) : 0;
  const remaining = showAvatars && friends.length > 3 ? friends.length - 3 : 0;

  // Total items to position (only avatars, badge will overlay the last one)
  const totalItems = displayCount;

  let avatarsHTML = "";

  // Calculate arc positions (frown shape - curves down at the sides)
  const getArcPosition = (index, total) => {
    // For symmetrical positioning
    const angleStep = total > 1 ? arcAngle / (total - 1) : 0;
    const startAngle = total > 1 ? -arcAngle / 2 : 0;
    const angle = startAngle + index * angleStep;

    // Convert to radians
    const angleRad = (angle * Math.PI) / 180;

    // Calculate position (frown = positive y for sides, negative for center)
    const x = arcRadius * Math.sin(angleRad);
    const y = -arcRadius + arcRadius * (1 - Math.cos(angleRad));

    return { x, y };
  };

  // Render friend avatars
  for (let i = 0; i < displayCount; i++) {
    const friend = friends[i];
    const pos = getArcPosition(i, totalItems);

    const avatarUrl =
      friend.profilePicture?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        friend.username
      )}&size=48&background=22c55e&color=fff`;

    avatarsHTML += `
      <div style="
        position: absolute;
        left: ${pos.x - avatarSize / 2}px;
        top: ${pos.y - avatarSize / 2}px;
        width: ${avatarSize}px;
        height: ${avatarSize}px;
        border-radius: 50%;
        border: 2px solid white;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: ${10 - i};
      ">
        <img 
          src="${avatarUrl}" 
          style="width: 100%; height: 100%; object-fit: cover;"
          alt="${friend.username}"
        />
      </div>
    `;

    // Add badge on top-right of last avatar if there are more friends
    if (i === displayCount - 1 && remaining > 0) {
      const badgeSize = 24;
      const badgeOffset = avatarSize * 0.6; // position to overlap on top-right
      avatarsHTML += `
        <div style="
          position: absolute;
          left: ${pos.x - avatarSize / 2 + badgeOffset + 3}px;
          top: ${pos.y - avatarSize / 2 - badgeOffset / 3 + 3}px;
          width: ${badgeSize}px;
          height: ${badgeSize}px;
          border-radius: 50%;
          border: 2px solid white;
          background: #22c55e;
          color: white;
          font-size: 11px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 20;
        ">
          +${remaining}
        </div>
      `;
    }
  }

  // Get the base icon HTML (the red/green dot)
  // Check for green color hex code in data URL (%2310b981 is URL-encoded #10b981)
  const baseIconHTML = baseIcon.options.iconUrl.includes("%2310b981")
    ? `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='6' fill='#10b981'/></svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='6' fill='#ef4444'/></svg>`;

  const combinedHTML = `
    <div style="position: relative; width: 12px; height: 12px;">
      ${avatarsHTML}
      <div style="position: absolute; left: -6px; top: -6px;">
        ${baseIconHTML}
      </div>
    </div>
  `;

  // Adjust popup anchor: when avatars shown, popup needs to align with the small dot
  // which is positioned lower in the icon due to the avatars above it
  const popupAnchorY = showAvatars ? -12 : -6;
  // Shift popup further left when avatars are hidden so it centers over the dot
  const popupAnchorX = showAvatars ? 3 : -6;

  return divIcon({
    html: combinedHTML,
    className: "friend-avatars-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [popupAnchorX, popupAnchorY],
  });
};
