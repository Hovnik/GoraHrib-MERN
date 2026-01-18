import { UserX, AlertTriangle } from "lucide-react";

const RemoveUserModal = ({ isOpen, onClose, user, onConfirm }) => {
  if (!isOpen) return null;

  const handleRemove = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-error mb-4" />
          <h3 className="font-bold text-lg mb-2">Odstrani Uporabnika</h3>
          <p className="text-gray-600 mb-2">
            Ali res želite odstraniti uporabnika{" "}
            {user && (
              <span className="font-semibold text-gray-800">
                {user.username}
              </span>
            )}
            ?
          </p>
          <p className="text-sm text-error mt-2">
            To dejanje je nepovratno in bo trajno izbrisalo račun.
          </p>
        </div>

        <div className="modal-action justify-center">
          <button onClick={handleRemove} className="btn btn-error gap-2">
            <UserX className="w-4 h-4" />
            Odstrani
          </button>
          <button onClick={onClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveUserModal;
