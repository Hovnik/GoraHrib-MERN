import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Mountain, CheckCircle, XCircle, Loader } from "lucide-react";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/auth/verify-email/${token}`
        );
        setStatus("success");
        setMessage(response.data.message || "Email uspešno preverjen!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Preverjanje ni uspelo. Povezava je morda potekla."
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Logo/Header */}
          <div className="flex flex-col items-center mb-4">
            <Mountain className="w-16 h-16 text-green-700 mb-2" />
            <h1 className="text-4xl font-bold text-green-800">GoraHrib</h1>
          </div>

          <div className="flex flex-col items-center space-y-4">
            {status === "verifying" && (
              <>
                <Loader className="w-16 h-16 text-green-600 animate-spin" />
                <p className="text-gray-600">Preverjam vaš email...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-600" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-700">
                    {message}
                  </p>
                  <Link to="/signin" className="btn btn-primary mt-4">
                    Pojdi na prijavo
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-red-600" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-700">
                    {message}
                  </p>
                  <Link to="/signin" className="btn btn-primary mt-4">
                    Pojdi na prijavo
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
