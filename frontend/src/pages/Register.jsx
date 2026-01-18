import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserPlus,
  Mountain,
  Eye,
  EyeOff,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react";
import api from "../config/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stats, setStats] = useState({
    peaks: 0,
    users: 0,
    climbs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const peaksRes = await api.get("/peaks");
        const peaksCount = peaksRes.data.peaks?.length || 0;

        setStats({
          peaks: peaksCount,
          users: 150,
          climbs: 2450,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Gesli se ne ujemata!");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(
        "Registracija uspešna! Preverite svoj email za potrditev.",
        { duration: 5000 },
      );

      // Navigate to sign in page after successful registration
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registracija ni uspela. Poskusite ponovno.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-green-100">
      {/* Animated gradient background styles */}
      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animated-gradient {
          background: linear-gradient(-45deg, #15803d, #16a34a, #22c55e, #10b981);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        
        
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .feature-item {
          transition: transform 0.2s ease;
        }
        
        .feature-item:hover {
          transform: translateX(10px);
        }
      `}</style>

      {/* Left Side - App Info */}
      <div className="hidden lg:flex lg:w-1/2 animated-gradient text-white p-12 flex-col justify-center">
        <div className="max-w-xl mx-auto fade-in">
          {/* Logo Section with darker background */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/10">
            <Mountain className="w-24 h-24 mb-4 drop-shadow-2xl" />
            <h1 className="text-6xl font-bold mb-3 drop-shadow-lg tracking-tight">
              GoraHrib
            </h1>
            <h2 className="text-3xl font-bold mb-3 text-green-100">
              Tvoja aplikacija za beleženje vrhov
            </h2>
            <p className="text-lg text-green-50/90 leading-relaxed">
              Beležite svoje gore, sledite napredku in deljite svoje dosežke s
              prijatelji.
            </p>
          </div>

          {/* Stats Cards - More prominent */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20 shadow-xl">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
              <div className="text-4xl font-extrabold">{stats.peaks}</div>
              <div className="text-xs font-semibold text-green-100 uppercase tracking-wider mt-1">
                Vrhov
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20 shadow-xl">
              <Users className="w-10 h-10 mx-auto mb-3 text-blue-300" />
              <div className="text-4xl font-extrabold">{stats.users}+</div>
              <div className="text-xs font-semibold text-green-100 uppercase tracking-wider mt-1">
                Uporabnikov
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20 shadow-xl">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-pink-300" />
              <div className="text-4xl font-extrabold">{stats.climbs}+</div>
              <div className="text-xs font-semibold text-green-100 uppercase tracking-wider mt-1">
                Vzponov
              </div>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 text-white text-lg">
            <li className="flex items-start gap-3">
              <span className="text-yellow-300 mt-1">✓</span>
              <span className="font-medium">
                Interaktivni zemljevid vseh slovenskih vrhov
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-300 mt-1">✓</span>
              <span className="font-medium">
                Osebni seznam in sledenje napredku
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-300 mt-1">✓</span>
              <span className="font-medium">
                Lestvica in primerjava s prijatelji
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-300 mt-1">✓</span>
              <span className="font-medium">Forum za izmenjavo izkušenj</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-300 mt-1">✓</span>
              <span className="font-medium">Odklepanje dosežkov in nagrad</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl fade-in">
          <div className="card-body">
            {/* Logo/Header - Mobile only */}
            <div className="flex flex-col items-center mb-2 lg:hidden">
              <Mountain className="w-16 h-16 text-green-700 mb-2" />
              <h1 className="text-4xl font-bold text-green-800">GoraHrib</h1>
              <p className="text-gray-600 mt-2">Pridružite se skupnosti!</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-2">
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Pridružite se skupnosti!
              </h1>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              Registracija
            </h2>

            {error && (
              <div className="alert alert-error mb-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-1">
                <label className="label">
                  <span className="label-text">Uporabniško Ime</span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Vnesite uporabniško ime"
                  className="input input-bordered"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control mb-1">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ime@primer.si"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-1">
                <label className="label">
                  <span className="label-text">Geslo</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Vnesite geslo"
                  className="input input-bordered w-full pr-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="relative mb-6">
                <label className="label">
                  <span className="label-text">Potrdi Geslo</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Ponovite geslo"
                  className="input input-bordered w-full pr-12"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Registracija...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Registriraj se
                  </>
                )}
              </button>
            </form>

            <div className="divider">ALI</div>

            <p className="text-center text-sm">
              Že imate račun?{" "}
              <Link to="/" className="link link-primary font-semibold">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
