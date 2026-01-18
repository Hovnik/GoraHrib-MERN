import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit2,
  Mountain,
  Trophy,
  Users,
  CheckCircle,
  KeyRound,
  Shield,
  ClipboardList,
} from "lucide-react";
import axios from "axios";
import EditProfileModal from "../../modals/profile-modals/edit-profile-modal";
import ChangePasswordModal from "../../modals/profile-modals/change-password-modal";
import AchievementsModal from "../../modals/profile-modals/achievements-modal";
import FriendsModal from "../../modals/profile-modals/friends-modal";
import VisitedPeaksModal from "../../modals/profile-modals/visited-peaks-modal";
import AdminModal from "../../modals/profile-modals/admin-modal";

const ProfileCard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showVisitedPeaksModal, setShowVisitedPeaksModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.user;

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
      } catch (error) {
        console.error("Error fetching user profile:", error);
        console.error("Error response:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="px-2 pt-4 flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
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
        navigate("/checklist");
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
          <p className="text-gray-600 mb-8">Član od: {user.memberSince}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-10">
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* First two buttons */}
            <div className="flex gap-3 justify-center sm:justify-start">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-primary gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Uredi Profil
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn btn-secondary gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Spremeni Geslo
              </button>
            </div>

            {/* Admin button */}
            {user.role === "ADMIN" && (
              <div className="flex justify-center sm:justify-start">
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="btn btn-accent gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              </div>
            )}
          </div>

          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          ></EditProfileModal>

          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
          ></ChangePasswordModal>

          <AchievementsModal
            isOpen={showAchievementsModal}
            onClose={() => setShowAchievementsModal(false)}
          />

          <FriendsModal
            isOpen={showFriendsModal}
            onClose={() => setShowFriendsModal(false)}
          />

          <VisitedPeaksModal
            isOpen={showVisitedPeaksModal}
            onClose={() => setShowVisitedPeaksModal(false)}
          />

          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
