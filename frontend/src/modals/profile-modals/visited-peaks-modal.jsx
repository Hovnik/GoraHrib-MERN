import { X, Image } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import PeakPhotosModal from "./peak-photos-modal";

const VisitedPeaksModal = ({ isOpen, onClose }) => {
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [selectedPeak, setSelectedPeak] = useState(null);

  const handleShowPictures = (peak) => {
    setSelectedPeak(peak);
    setShowPhotosModal(true);
  };

  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const visitedPeaks = checklist.filter((item) => item.status === "Visited");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">Osvojeni Vrhovi</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-80 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Vrh</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-8">
                      <div className="flex justify-center items-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                      </div>
                    </td>
                  </tr>
                ) : visitedPeaks.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Nimate še obiskanih vrhov.
                    </td>
                  </tr>
                ) : (
                  visitedPeaks.map((peak) => (
                    <tr key={peak._id}>
                      <td>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {peak.peakId?.name}
                          </p>
                        </div>
                      </td>
                      <td className="text-gray-600">
                        {peak.visitedDate
                          ? new Date(peak.visitedDate).toLocaleDateString(
                              "sl-SI",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleShowPictures(peak)}
                            className="btn btn-sm btn-secondary gap-2"
                            title="Fotografije"
                            disabled={
                              !peak.pictures || peak.pictures.length === 0
                            }
                          >
                            <Image className="w-4 h-4" />
                          </button>
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

      <PeakPhotosModal
        isOpen={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
        peak={selectedPeak}
      />
    </div>
  );
};

export default VisitedPeaksModal;
