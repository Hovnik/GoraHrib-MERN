import { AlertTriangle } from "lucide-react";
import axios from "axios";

const DeleteFromChecklistModal = ({ isOpen, onClose, onConfirm, peak }) => {
  if (!isOpen) return null;

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:3000/api/checklist/${peak.peakId._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onConfirm();
    } catch (error) {
      console.error("Napaka pri brisanju vrha iz seznama:", error);
      alert(error.response?.data?.message || "Napaka pri brisanju vrha");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-warning mb-4" />
          <h3 className="font-bold text-lg mb-2">Izbriši iz Seznama?</h3>
          <p className="text-gray-600 mb-2">
            Ali ste prepričani, da želite izbrisati{" "}
            <strong>{peak.peakId.name}</strong> iz vašega seznama?
          </p>
        </div>

        <div className="modal-action justify-center">
          <button onClick={handleDelete} className="btn btn-error">
            Izbriši
          </button>
          <button onClick={onClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFromChecklistModal;
