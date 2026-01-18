import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../../config/axios";

const AddPeakToChecklistModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeaks, setSelectedPeaks] = useState([]);
  const [peaks, setPeaks] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [peaksRes, checklistRes] = await Promise.all([
          api.get("/api/peaks"),
          token
            ? api.get("/api/checklist", {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: { checklist: [] } }),
        ]);

        setPeaks(peaksRes.data.peaks || []);
        setChecklist(checklistRes.data.checklist || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setPeaks([]);
        setChecklist([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      getData();
    }
  }, [isOpen]);

  const handleAddPeak = async () => {
    if (selectedPeaks.length === 0) return;

    const token = localStorage.getItem("token");
    setAdding(true);

    try {
      // Add peaks sequentially to avoid write conflicts
      for (const peak of selectedPeaks) {
        await api.post(
          `/api/checklist/${peak._id}`,
          {}
        );
      }

      setSearchTerm("");
      setSelectedPeaks([]);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding peaks to checklist:", error);
      alert(error.response?.data?.message || "Napaka pri dodajanju vrhov");
    } finally {
      setAdding(false);
    }
  };

  // Toggle peak selection
  const togglePeakSelection = (peak) => {
    setSelectedPeaks((prev) => {
      const isSelected = prev.some((p) => p._id === peak._id);
      if (isSelected) {
        return prev.filter((p) => p._id !== peak._id);
      } else {
        return [...prev, peak];
      }
    });
  };

  // Check if peak is selected
  const isPeakSelected = (peakId) => {
    return selectedPeaks.some((p) => p._id === peakId);
  };

  // Check if peak is already in checklist
  const isPeakInChecklist = (peakId) => {
    return checklist.some((item) => {
      const itemPeakId =
        typeof item.peakId === "string" ? item.peakId : item.peakId?._id;
      return itemPeakId === peakId;
    });
  };

  const filteredPeaks = peaks.filter((peak) =>
    peak.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">Dodaj Vrhove na Seznam</h3>

        {/* Selected count */}
        {selectedPeaks.length > 0 && (
          <div className="alert alert-info mb-4">
            <span>
              Izbrano: {selectedPeaks.length}{" "}
              {selectedPeaks.length === 1
                ? "vrh"
                : selectedPeaks.length === 2
                ? "vrhova"
                : selectedPeaks.length === 3 || selectedPeaks.length === 4
                ? "vrhovi"
                : "vrhov"}
            </span>
          </div>
        )}

        {/* Search Input */}
        <div className="form-control mb-4">
          <div className="input-group">
            <input
              type="text"
              placeholder="Išči vrh..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Peaks List */}
        <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredPeaks.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Ni rezultatov</p>
          ) : (
            filteredPeaks.map((peak) => {
              const isInChecklist = isPeakInChecklist(peak._id);
              const isSelected = isPeakSelected(peak._id);
              return (
                <div
                  key={peak._id}
                  onClick={() => !isInChecklist && togglePeakSelection(peak)}
                  className={`p-3 border rounded-lg transition-colors ${
                    isInChecklist
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-primary text-primary-content border-primary cursor-pointer"
                      : "hover:bg-base-200 cursor-pointer"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{peak.name}</h4>
                      <p className="text-sm opacity-80">
                        {peak.elevation}m - {peak.mountainRange}
                      </p>
                    </div>
                    {isInChecklist ? (
                      <div className="badge badge-sm whitespace-nowrap flex-shrink-0">
                        <span className="hidden sm:inline">Že na seznamu</span>
                        <span className="inline sm:hidden">Na seznamu</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-action justify-center">
          <button
            onClick={handleAddPeak}
            disabled={selectedPeaks.length === 0 || adding}
            className="btn btn-success gap-2"
          >
            {adding ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Dodajam...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Dodaj{" "}
                {selectedPeaks.length > 0 ? `(${selectedPeaks.length})` : ""}
              </>
            )}
          </button>
          <button onClick={onClose} className="btn" disabled={adding}>
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPeakToChecklistModal;
