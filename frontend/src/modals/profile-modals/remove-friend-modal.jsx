import { UserMinus, AlertTriangle } from "lucide-react";

const RemoveFriendModal = ({ isOpen, onClose, friend, onConfirm }) => {
  if (!isOpen || !friend) return null;

  const handleRemove = () => {
    onConfirm(friend._id);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-16 h-16 text-warning mb-4" />
          <h3 className="font-bold text-lg mb-2">Odstrani Prijatelja</h3>
          <p className="text-gray-600 mb-2">
            Ste prepričani, da želite odstraniti{" "}
            <span className="font-semibold text-gray-800">
              {friend.user?.username}
            </span>{" "}
            iz vašega seznama prijateljev?
          </p>
        </div>

        <div className="modal-action justify-center">
          <button onClick={handleRemove} className="btn btn-error gap-2">
            <UserMinus className="w-4 h-4" />
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

export default RemoveFriendModal;
