import { Link } from "react-router";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 text-error mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Stran ne obstaja
        </h2>
        <p className="text-gray-600 mb-8">
          Oprostite, stran, ki jo iščete, ne obstaja.
        </p>
        <Link to="/" className="btn btn-primary">
          Nazaj na prijavo
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
