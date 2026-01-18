import { X, UserMinus, UserPlus, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import RemoveFriendModal from "./remove-friend-modal";
import AddFriendModal from "./add-friend-modal";
import api from "../../config/axios";

const FriendsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAvatarSrc = (obj, username) => {
    // obj may be a friend record (with .profilePicture or .user.profilePicture)
    // or a user object. Support both new object shape and legacy string.
    const profile = obj?.profilePicture ?? obj?.user?.profilePicture;
    if (profile && typeof profile === "object" && profile.url)
      return profile.url;
    if (typeof profile === "string") return profile;
    const name = username ?? obj?.user?.username ?? obj?.username ?? "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=40&background=22c55e&color=fff`;
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchFriendsAndRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const friendsResponse = await api.get(
          "/api/friends?status=Accepted",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriends(friendsResponse.data.friends || []);

        const requestsResponse = await api.get(
          "/api/friends?status=Pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRequests(requestsResponse.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends or requests:", error);
        // Set empty arrays on error to prevent crashes
        setFriends([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsAndRequests();
  }, [isOpen]);

  const refreshFriendsAndRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [friendsResponse, requestsResponse] = await Promise.all([
        api.get("/api/friends?status=Accepted", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/friends?status=Pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFriends(friendsResponse.data.friends || []);
      setRequests(requestsResponse.data.friends || []);
    } catch (error) {
      console.error("Error refreshing friends and requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = (friendId) => {
    const friend = friends.find((f) => f._id === friendId);
    if (friend) {
      setFriendToRemove(friend);
      setShowRemoveModal(true);
    }
  };

  const handleConfirmRemove = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/friends/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh friends list
      const friendsResponse = await api.get(
        "/api/friends?status=Accepted",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriends(friendsResponse.data.friends);
      setShowRemoveModal(false);
      setFriendToRemove(null);
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Napaka pri odstranjevanju prijatelja");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/friends/accept/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh both friends and requests
      const [friendsResponse, requestsResponse] = await Promise.all([
        api.get("/api/friends?status=Accepted", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/friends?status=Pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFriends(friendsResponse.data.friends);
      setRequests(requestsResponse.data.friends);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Napaka pri sprejemanju zahteve za prijateljstvo");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(
        `/api/friends/request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh requests
      const requestsResponse = await api.get(
        "/api/friends?status=Pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(requestsResponse.data.friends);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Napaka pri zavračanju zahteve za prijateljstvo");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">Prijatelji</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="tabs tabs-boxed flex-1 mr-2">
            <a
              className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("friends")}
            >
              Prijatelji ({friends?.length || 0})
            </a>
            <a
              className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Prošnje ({requests?.length || 0})
            </a>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddFriendModal(true)}
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : activeTab === "friends" ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <tbody>
                  {!friends || friends.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-gray-500"
                      >
                        Nimaš še prijateljev.
                      </td>
                    </tr>
                  ) : (
                    friends.map((friend) => (
                      <tr key={friend._id}>
                        <td>
                          <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-base-200 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => {
                              navigate(`/profile/${friend.user?._id}`);
                              onClose();
                            }}
                          >
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full">
                                <img
                                  src={getAvatarSrc(
                                    friend,
                                    friend.user?.username
                                  )}
                                  alt={friend.user?.username}
                                />
                              </div>
                            </div>
                            <span className="font-medium">
                              {friend.user?.username}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRemoveFriend(friend._id)}
                              className="btn btn-sm btn-error gap-2"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <tbody>
                  {!requests || requests.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-8 text-gray-500"
                      >
                        Nimaš novih zahtev za prijateljstvo.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-base-200 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => {
                              navigate(`/profile/${request.user?._id}`);
                              onClose();
                            }}
                          >
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full">
                                <img
                                  src={getAvatarSrc(
                                    request.user,
                                    request.user?.username
                                  )}
                                  alt={request.user?.username}
                                />
                              </div>
                            </div>
                            <span className="font-medium">
                              {request.user?.username}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="btn btn-sm btn-success gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="btn btn-sm btn-error gap-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RemoveFriendModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        friend={friendToRemove}
        onConfirm={handleConfirmRemove}
      />

      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onFriendAdded={refreshFriendsAndRequests}
      />
    </div>
  );
};

export default FriendsModal;
