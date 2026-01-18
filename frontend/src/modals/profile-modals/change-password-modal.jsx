import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Nova gesla se ne ujemata!");
      return;
    }
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error("Vsa polja so obvezna!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/api/user/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Geslo uspešno spremenjeno!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } catch (error) {
      console.error("Napaka pri spreminjanju gesla:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri spreminjanju gesla"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Spremeni Geslo</h3>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Trenutno Geslo</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              placeholder="Vnesi trenutno geslo"
              className="input input-bordered w-full pr-10"
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Novo Geslo</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Vnesi novo geslo"
              className="input input-bordered w-full pr-10"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Potrdi Novo Geslo</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Potrdi novo geslo"
              className="input input-bordered w-full pr-10"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="modal-action justify-center">
          <button onClick={handleSubmit} className="btn btn-primary">
            Spremeni
          </button>
          <button onClick={onClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
