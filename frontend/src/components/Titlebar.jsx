import { LogOut } from "lucide-react";
import LogoutModal from "../modals/logout-modal";
import { useState } from "react";
import { Link } from "react-router";

const Titlebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div
      data-theme="lemonade"
      className="navbar bg-green-800 fixed top-0 left-0 right-0 z-50 h-16 min-h-16"
    >
      {/* Left */}
      <div className="navbar-start">
        <Link
          to="/map"
          className="text-white text-4xl font-bold pl-0 md:pl-3 flex items-center h-16"
        >
          GoraHrib
        </Link>
      </div>

      {/* Right */}
      <div className="navbar-end">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="btn btn-primary btn-sm text-white mr-4 gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Odjavi se</span>
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Titlebar;
