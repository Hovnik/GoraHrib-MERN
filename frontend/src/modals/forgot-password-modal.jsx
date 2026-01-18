import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Sending forgot password request for:", email);
      const response = await axios.post(
        "http://localhost:3000/api/auth/forgot-password",
        {
          email,
        }
      );
      console.log("Forgot password response:", response.data);
      toast.success(
        response.data.message ||
          "Če obstaja račun s tem emailom, smo poslali novo geslo.",
        { duration: 5000 }
      );
      setEmail("");
      onClose();
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err.response?.data?.message || "Napaka pri pošiljanju.", {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">Pozabili geslo?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Vnesite svoj email in poslali vam bomo nadaljnja navodila za
          ponastavitev gesla.
        </p>

        <form>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="ime@primer.si"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center gap-2">
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Pošiljanje..." : "Pošlji navodila"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={loading}
            >
              Prekliči
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ForgotPasswordModal;
