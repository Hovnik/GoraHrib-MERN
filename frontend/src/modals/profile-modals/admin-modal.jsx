import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, BarChart3, Trash2, Ban, Search, X } from "lucide-react";
import RemoveFriendModal from "./remove-friend-modal";
import RemoveUserModal from "./remove-user-modal";

const AdminModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isOpen && activeTab === "users") {
      fetchUsers();
    } else if (isOpen && activeTab === "statistics") {
      fetchStatistics();
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Napaka pri nalaganju uporabnikov");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/admin/statistics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Napaka pri nalaganju statistike");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBanUser = async (userId, username, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const message =
        currentStatus === "ACTIVE"
          ? `Uporabnik ${username} je blokiran`
          : `Uporabnik ${username} je odblokiran`;
      toast.success(message);
      fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri odblokiranju uporabnika"
      );
    }
  };

  const handleDeleteUser = async (userId, username) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Uporabnik ${username} je izbrisan`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri brisanju uporabnika"
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Admin Panel</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab gap-2 ${activeTab === "users" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4" />
            Uporabniki
          </button>
          <button
            className={`tab gap-2 ${
              activeTab === "statistics" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("statistics")}
          >
            <BarChart3 className="w-4 h-4" />
            Statistika
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {/* Search */}
            <div className="form-control mb-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Išči uporabnika..."
                  className="input input-bordered flex-1 min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-square flex-shrink-0">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Users List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Uporabniško ime</th>
                      <th>Email</th>
                      <th>Vloga</th>
                      <th>Status</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.role === "ADMIN"
                                ? "badge-primary"
                                : "badge-ghost"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              user.status === "ACTIVE"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          {user.role !== "ADMIN" && (
                            <>
                              <button
                                onClick={() =>
                                  handleToggleBanUser(
                                    user._id,
                                    user.username,
                                    user.status
                                  )
                                }
                                className={`btn btn-xs gap-1 ${
                                  user.status === "ACTIVE"
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                              >
                                <Ban className="w-3 h-3" />
                                {user.status === "ACTIVE"
                                  ? "Blokiraj"
                                  : "Odblokiraj"}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRemoveUserModal(true);
                                }}
                                className="btn btn-xs btn-error gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Izbriši
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : statistics ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Skupaj uporabnikov</div>
                  <div className="stat-value text-primary">
                    {statistics.totalUsers || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Aktivnih uporabnikov</div>
                  <div className="stat-value text-success">
                    {statistics.activeUsers || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Blokiranih</div>
                  <div className="stat-value text-error">
                    {statistics.inactiveUsers || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Skupaj vrhov</div>
                  <div className="stat-value text-info">
                    {statistics.totalPeaks || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Forum objav</div>
                  <div className="stat-value text-warning">
                    {statistics.totalPosts || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Komentarjev</div>
                  <div className="stat-value">
                    {statistics.totalComments || 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <span>Ni podatkov</span>
              </div>
            )}
          </div>
        )}
      </div>
      <RemoveUserModal
        isOpen={showRemoveUserModal}
        onClose={() => setShowRemoveUserModal(false)}
        user={selectedUser}
        onConfirm={() =>
          selectedUser &&
          handleDeleteUser(selectedUser._id, selectedUser.username)
        }
      />
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default AdminModal;
