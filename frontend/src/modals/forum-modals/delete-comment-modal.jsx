import { AlertTriangle } from "lucide-react";

const DeleteCommentModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-warning mb-4" />
          <h3 className="font-bold text-lg mb-2">Izbriši Komentar?</h3>
          <p className="text-gray-600 mb-4">
            Ali ste prepričani, da želite izbrisati ta komentar?
            <br />
            Tega dejanja ne morete razveljaviti.
          </p>
        </div>

        <div className="modal-action justify-center">
          <button onClick={onConfirm} className="btn btn-error">
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

export default DeleteCommentModal;
