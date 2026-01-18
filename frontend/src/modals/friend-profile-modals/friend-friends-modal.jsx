import { X } from "lucide-react";

const FriendFriendsModal = ({ isOpen, onClose, friends: friendsFriends }) => {
  // Use the friends prop directly
  const friends = friendsFriends || [];

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

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">
            Prijatelji ({friends?.length || 0})
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-80 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <tbody>
                {!friends || friends.length === 0 ? (
                  <tr>
                    <td className="text-center py-8 text-gray-500">
                      Ta oseba nima prijateljev.
                    </td>
                  </tr>
                ) : (
                  friends.map((friend) => (
                    <tr key={friend._id}>
                      <td>
                        <div className="flex items-center gap-3 rounded-lg p-2 -m-2 transition-colors">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendFriendsModal;
