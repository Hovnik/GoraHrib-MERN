import { MapPin, AlertCircle } from "lucide-react";

const LocationErrorModal = ({ isOpen, onClose, errorMessage, distance }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-error/20 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h3 className="font-bold text-lg">Lokacija ni ustrezna</h3>
        </div>

        <p className="text-base mb-4">{errorMessage}</p>

        {distance && (
          <div className="alert alert-warning">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="font-semibold">Vaša oddaljenost: {distance}</p>
              <p className="text-sm">Morate biti znotraj 100m od vrha.</p>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-base-200 rounded-lg">
          <p className="text-sm font-semibold mb-2">Navodila:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Preverite, da je GPS omogočen na vaši napravi</li>
            <li>Poskrbite, da ste dejansko na vrhu</li>
            <li>Počakajte, da se GPS signal stabilizira</li>
            <li>V primeru težav poskusite ponovno</li>
          </ul>
        </div>

        <div className="modal-action justify-center">
          <button onClick={onClose} className="btn btn-primary">
            Razumem
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationErrorModal;
