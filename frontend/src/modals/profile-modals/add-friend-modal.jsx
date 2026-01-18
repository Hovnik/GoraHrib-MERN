import { X, Search, UserPlus, UserCheck, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../config/axios";

const AddFriendModal = ({ isOpen, onClose, onFriendAdded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [sendingRequests, setSendingRequests] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setFriendStatuses({});
    }
  }, [isOpen]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Searching for:", searchQuery);
      const response = await api.get(
        `/api/user/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Search response:", response.data);
      setSearchResults(response.data.users || []);

      // Check friend status for each user
      const statusPromises = response.data.users.map((user) =>
        checkFriendStatus(user._id)
      );
      const statuses = await Promise.all(statusPromises);

      const statusMap = {};
      response.data.users.forEach((user, index) => {
        statusMap[user._id] = statuses[index];
      });
      setFriendStatuses(statusMap);
    } catch (error) {
      console.error("Error searching users:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await searchUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const checkFriendStatus = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const friends = response.data.friends || [];
      const friendship = friends.find((f) => f.user._id === userId);

      if (friendship) {
        return friendship.status; // 'Accepted' or 'Pending'
      }
      return null; // Not friends
    } catch (error) {
      console.error("Error checking friend status:", error);
      return null;
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      setSendingRequests((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      await api.post(
        `/api/friends/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the friend status for this user
      setFriendStatuses((prev) => ({
        ...prev,
        [userId]: "Pending",
      }));

      if (onFriendAdded) {
        onFriendAdded();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Napaka pri pošiljanju zahteve za prijateljstvo");
    } finally {
      setSendingRequests((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const renderActionButton = (user) => {
    const status = friendStatuses[user._id];
    const isSending = sendingRequests[user._id];

    if (isSending) {
      return (
        <button className="btn btn-sm btn-disabled" disabled>
          <span className="loading loading-spinner loading-xs"></span>
        </button>
      );
    }

    if (status === "Accepted") {
      return (
        <button className="btn btn-sm btn-success gap-2" disabled>
          <UserCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Prijatelj</span>
        </button>
      );
    }

    if (status === "Pending") {
      return (
        <button className="btn btn-sm btn-warning gap-2" disabled>
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">V obdelavi</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => handleSendFriendRequest(user._id)}
        className="btn btn-sm btn-primary gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Dodaj</span>
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">Dodaj prijatelja</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="form-control mb-4">
          <div className="input-group">
            <input
              type="text"
              placeholder="Išči uporabnike"
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : searchResults.length === 0 && searchQuery.trim() ? (
            <div className="text-center py-8 text-gray-500">
              Ni najdenih uporabnikov
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Začni vpisovati, da poiščeš uporabnike
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <tbody>
                  {searchResults.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              <img
                                src={
                                  user.profilePicture ||
                                  `https://ui-avatars.com/api/?name=${user.username}&size=40&background=22c55e&color=fff`
                                }
                                alt={user.username}
                              />
                            </div>
                          </div>
                          <div className="font-medium">{user.username}</div>
                        </div>
                      </td>
                      <td className="text-right">{renderActionButton(user)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
