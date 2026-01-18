import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center text-center">
          <LogOut className="w-16 h-16 text-error mb-4" />
          <h3 className="font-bold text-lg mb-2">Odjava</h3>
          <p className="text-gray-600 mb-2">
            Ste prepričani, da se želite odjaviti iz vašega računa?
          </p>
        </div>

        <div className="modal-action justify-center">
          <button onClick={handleLogout} className="btn btn-error">
            Odjavi se
          </button>
          <button onClick={onClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
