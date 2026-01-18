import { useState, useEffect } from "react";
import { ClipboardList, Trophy, Users, CheckCircle } from "lucide-react";
import axios from "axios";
import FriendAchievementsModal from "../../modals/friend-profile-modals/friend-achievements-modal";
import FriendFriendsModal from "../../modals/friend-profile-modals/friend-friends-modal";
import FriendVisitedPeaksModal from "../../modals/friend-profile-modals/friend-visited-peaks-modal";
import FriendChecklistModal from "../../modals/friend-profile-modals/friend-checklist-modal";

const FriendProfileCard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showVisitedPeaksModal, setShowVisitedPeaksModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Friend's data from /friends/:userId
  const [friendData, setFriendData] = useState({
    achievements: [],
    visitedPeaks: [],
    checklistPeaks: [],
    friends: [],
  });

  useEffect(() => {
    const fetchFriendProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch user profile and friend data in parallel
        const [userResponse, friendDataResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3000/api/friends/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = userResponse.data.user;

        const memberSince = userData.createdAt
          ? new Date(userData.createdAt).toLocaleDateString("sl-SI", {
              year: "numeric",
              month: "long",
            })
          : "/";

        const profilePicture =
          (userData.profilePicture && userData.profilePicture.url) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.username,
          )}&size=200&background=22c55e&color=fff`;

        setUser({
          id: userData._id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          profilePicture: profilePicture,
          memberSince: memberSince,
          friendsCount: userData.friendsCount || 0,
          achievementsCount: userData.achievementsCount || 0,
          finishedPeaksCount: userData.finishedPeaksCount || 0,
          peaksCount: userData.peaksCount || 0,
        });

        // Set friend data
        setFriendData({
          achievements: friendDataResponse.data.achievements || [],
          visitedPeaks: friendDataResponse.data.visitedPeaks || [],
          checklistPeaks: friendDataResponse.data.checklistPeaks || [],
          friends: friendDataResponse.data.friends || [],
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        console.error("Error response:", error.response?.data);

        // Set user-friendly error message
        if (error.response?.status === 400) {
          setError("Neveljaven ID uporabnika");
        } else if (error.response?.status === 404) {
          setError("Uporabnik ni bil najden ali nista prijatelja");
        } else if (error.response?.status === 401) {
          setError("Nimate dovoljenja za ogled tega profila");
        } else {
          setError("Napaka pri nalaganju profila");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriendProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-2 pt-4 flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 pt-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-2 pt-4">
        <div className="alert alert-error">
          <span>Napaka pri nalaganju profila</span>
        </div>
      </div>
    );
  }

  const handleStatClick = (statLabel) => {
    switch (statLabel) {
      case "Na Seznamu":
        setShowChecklistModal(true);
        break;
      case "Dosežki":
        setShowAchievementsModal(true);
        break;
      case "Prijatelji":
        setShowFriendsModal(true);
        break;
      case "Osvojenih":
        setShowVisitedPeaksModal(true);
        break;
      default:
        break;
    }
  };

  const stats = [
    {
      label: "Na Seznamu",
      value: user.peaksCount - user.finishedPeaksCount,
      icon: ClipboardList,
      color: "text-blue-600",
    },
    {
      label: "Osvojenih",
      value: user.finishedPeaksCount,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Dosežki",
      value: user.achievementsCount,
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      label: "Prijatelji",
      value: user.friendsCount,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="px-2 pt-4">
      {/* Profile Header Card */}
      <div className="lg:card lg:bg-base-100 lg:shadow-xl mb-8">
        <div className="lg:card-body flex flex-col items-center">
          {/* Profile Picture */}
          <div className="avatar mb-4">
            <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={user.profilePicture} alt={user.username} />
            </div>
          </div>

          {/* Username and Info */}
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            {user.username}
          </h1>
          <p className="text-gray-600 mb-4">Član od: {user.memberSince}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  onClick={() => handleStatClick(stat.label)}
                  className="card bg-base-200 shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                >
                  <div className="card-body p-4 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <FriendAchievementsModal
            isOpen={showAchievementsModal}
            onClose={() => setShowAchievementsModal(false)}
            achievements={friendData.achievements}
          />

          <FriendFriendsModal
            isOpen={showFriendsModal}
            onClose={() => setShowFriendsModal(false)}
            friends={friendData.friends}
          />

          <FriendVisitedPeaksModal
            isOpen={showVisitedPeaksModal}
            onClose={() => setShowVisitedPeaksModal(false)}
            visitedPeaks={friendData.visitedPeaks}
          />

          <FriendChecklistModal
            isOpen={showChecklistModal}
            onClose={() => setShowChecklistModal(false)}
            checklistPeaks={friendData.checklistPeaks}
          />
        </div>
      </div>
    </div>
  );
};

export default FriendProfileCard;
