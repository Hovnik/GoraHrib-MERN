import ChecklistRow from "./ChecklistRow";
import { useState, useEffect } from "react";
import axios from "axios";

const ChecklistTable = ({ activeTab }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const wishlistPeaks = checklist.filter((item) => item.status === "Wishlist");
  const visitedPeaks = checklist.filter((item) => item.status === "Visited");
  const peaks = activeTab === "wishlist" ? wishlistPeaks : visitedPeaks;

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/checklist",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChecklist(response.data.checklist);
      } catch (error) {
        console.error("Error fetching checklist peaks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, []);

  const handleDelete = (peakId) => {
    setChecklist((prev) => prev.filter((item) => item.peakId._id !== peakId));
  };

  const handleVisit = (peakId) => {
    // Just update local state - API call is made in ChecklistRow
    setChecklist((prev) =>
      prev.map((item) =>
        item.peakId._id === peakId ? { ...item, status: "Visited" } : item
      )
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full table-fixed">
        <thead>
          <tr>
            <th className="w-1/8">Ime Vrha</th>
            <th className="w-1/8">Višina</th>
            <th className="hidden md:table-cell w-1/2">Območje</th>
            <th className="w-2/8" />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </td>
            </tr>
          ) : peaks.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 italic py-8">
                Ni podatkov
              </td>
            </tr>
          ) : (
            peaks.map((peak) => (
              <ChecklistRow
                key={peak.peakId}
                peak={peak}
                activeTab={activeTab}
                onDelete={handleDelete}
                onVisit={handleVisit}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChecklistTable;
