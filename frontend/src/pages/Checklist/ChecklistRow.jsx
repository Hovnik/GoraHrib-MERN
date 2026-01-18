import { CheckCircle, Trash2, Share2 } from "lucide-react";
import DeleteFromChecklistModal from "../../modals/checklist-modals/delete-from-checklist-modal";
import MarkVisitedModal from "../../modals/checklist-modals/mark-visited-modal";
import ShareVisitedPeakModal from "../../modals/checklist-modals/share-visited-peak-modal";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ChecklistRow = ({ peak, activeTab, onDelete, onVisit }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarkVisitedModalOpen, setIsMarkVisitedModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(peak.peakId._id);
    setIsDeleteModalOpen(false);
  };

  const handleMarkVisitedConfirm = async (pictureFiles) => {
    try {
      const token = localStorage.getItem("token");

      // First, mark peak as visited
      const response = await axios.put(
        `http://localhost:3000/api/checklist/${peak.peakId._id}/visit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Check for new achievements and show notifications
      if (
        response.data.newAchievements &&
        response.data.newAchievements.length > 0
      ) {
        response.data.newAchievements.forEach((achievement) => {
          toast.success(
            <div>
              <p className="font-bold">
                Novi dosežek odklenjen! {achievement.badge}
              </p>
              <p className="text-sm">{achievement.title}</p>
            </div>,
            { duration: 5000 },
          );
        });

        // Dispatch custom event for achievement refresh
        window.dispatchEvent(new CustomEvent("achievementsUpdated"));
      }

      // Update local state
      await onVisit(peak.peakId._id);

      // Then upload pictures if any using FormData
      if (pictureFiles && pictureFiles.length > 0) {
        const formData = new FormData();

        // Append each file to FormData
        pictureFiles.forEach((file) => {
          formData.append("pictures", file);
        });

        await axios.put(
          `http://localhost:3000/api/checklist/${peak.peakId._id}/pictures`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        toast.success("Slike uspešno naložene!");
      }

      setIsMarkVisitedModalOpen(false);
    } catch (error) {
      console.error("Error marking as visited or uploading pictures:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri obdelavi zahteve",
      );
    }
  };

  // Handle case where peakId might be null (deleted peak)
  if (!peak.peakId) {
    return null;
  }

  return (
    <>
      <tr>
        <td className="font-semibold">{peak.peakId.name}</td>
        <td>{peak.peakId.elevation}</td>
        <td className="hidden md:table-cell">{peak.peakId.mountainRange}</td>
        <td>
          <div className="flex justify-end gap-2">
            {activeTab === "wishlist" && (
              <button
                onClick={() => setIsMarkVisitedModalOpen(true)}
                className="btn btn-sm btn-success gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden md:inline">Osvojen</span>
              </button>
            )}
            {activeTab === "visited" && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn btn-sm btn-info gap-1"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Deli</span>
              </button>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-sm btn-error"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <DeleteFromChecklistModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        peak={peak}
      />

      <MarkVisitedModal
        isOpen={isMarkVisitedModalOpen}
        onClose={() => setIsMarkVisitedModalOpen(false)}
        onConfirm={handleMarkVisitedConfirm}
        peakName={peak.peakId.name}
      />

      <ShareVisitedPeakModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        peakId={peak.peakId._id}
        peakName={peak.peakId.name}
      />
    </>
  );
};

export default ChecklistRow;
