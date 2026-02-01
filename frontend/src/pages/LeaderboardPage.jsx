import { useState, useEffect } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import api from "../config/axios";

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/api/leaderboard?type=${encodeURIComponent(
          type === "friends" ? "Friends" : "Global",
        )}`,
      );
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Napaka pri nalaganju lestvice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const peakWord = (n) => {
    if (typeof n !== "number") return "vrhovi";
    if (n === 1) return "vrh";
    if (n === 2) return "vrhova";
    return "vrhovi";
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lestvica</h1>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === "global" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("global")}
        >
          Globalna Lestvica
        </a>
        <a
          className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          Prijatelji
        </a>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && leaderboard.length === 0 && (
        <div className="text-center py-20 text-gray-500 italic">
          <p>Ni podatkov za prikaz</p>
        </div>
      )}

      {/* Leaderboard Content */}
      {!loading && !error && leaderboard.length > 0 && (
        <>
          {/* Podium - Classic style with 1st in middle */}
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex-1 flex flex-col items-center max-w-[140px]">
                  <div className="mb-3">
                    <Medal className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg border-4 border-white overflow-hidden bg-gray-300">
                    <img
                      src={
                        topThree[1]?.profilePicture?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          topThree[1]?.username || "User",
                        )}&size=96&background=22c55e&color=fff`
                      }
                      alt={topThree[1]?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg px-3 py-4 pb-12 shadow-lg border-2 border-gray-400">
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-gray-800 text-center mb-1 text-sm">
                        {topThree[1]?.username}
                      </p>
                      <p className="text-2xl font-bold text-gray-700">
                        {topThree[1]?.peaksClimbed}
                      </p>
                      <p className="text-xs text-gray-600">
                        {peakWord(topThree[1]?.peaksClimbed)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-5xl font-bold text-gray-500">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place - Taller */}
              {topThree[0] && (
                <div className="flex-1 flex flex-col items-center max-w-[160px]">
                  <div className="mb-3">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3 shadow-xl border-4 border-white overflow-hidden bg-yellow-300">
                    <img
                      src={
                        topThree[0]?.profilePicture?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          topThree[0]?.username || "User",
                        )}&size=112&background=22c55e&color=fff`
                      }
                      alt={topThree[0]?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-t-lg px-4 py-5 pb-20 shadow-xl border-2 border-yellow-500">
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-gray-800 text-center mb-1">
                        {topThree[0]?.username}
                      </p>
                      <p className="text-3xl font-bold text-gray-800">
                        {topThree[0]?.peaksClimbed}
                      </p>
                      <p className="text-sm text-gray-700">
                        {peakWord(topThree[0]?.peaksClimbed)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-6xl font-bold text-yellow-600">
                      1
                    </span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex-1 flex flex-col items-center max-w-[130px]">
                  <div className="mb-3">
                    <Award className="w-8 h-8 text-amber-700" />
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg border-4 border-white overflow-hidden bg-orange-300">
                    <img
                      src={
                        topThree[2]?.profilePicture?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          topThree[2]?.username || "User",
                        )}&size=80&background=22c55e&color=fff`
                      }
                      alt={topThree[2]?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-t-lg px-3 py-4 pb-8 shadow-lg border-2 border-orange-400">
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-gray-800 text-center mb-1 text-sm">
                        {topThree[2]?.username}
                      </p>
                      <p className="text-xl font-bold text-gray-700">
                        {topThree[2]?.peaksClimbed}
                      </p>
                      <p className="text-xs text-gray-600">
                        {peakWord(topThree[2]?.peaksClimbed)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-4xl font-bold text-orange-600">
                      3
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rest of leaderboard - Table format */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="w-16">Mesto</th>
                  <th>Uporabnik</th>
                  <th className="text-right">Vrhovi</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((user) => (
                  <tr key={user.userId} className="hover">
                    <td className="font-semibold text-gray-600">{user.rank}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                          <img
                            src={
                              user.profilePicture?.url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.username || "User",
                              )}&size=40&background=22c55e&color=fff`
                            }
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="text-right font-semibold">
                      {user.peaksClimbed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && !error && leaderboard.length <= 3 && (
            <div className="text-center py-20 text-gray-500 italic">
              <p>Ni podatkov za prikaz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
