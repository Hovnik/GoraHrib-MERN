import { CheckCircle, Trash2, Share2 } from "lucide-react";
import DeleteFromChecklistModal from "../../modals/checklist-modals/delete-from-checklist-modal";
import MarkVisitedModal from "../../modals/checklist-modals/mark-visited-modal";
import ShareVisitedPeakModal from "../../modals/checklist-modals/share-visited-peak-modal";
import LocationErrorModal from "../../modals/checklist-modals/location-error-modal";
import { useState } from "react";
import api from "../../config/axios";
import toast from "react-hot-toast";

const ChecklistRow = ({ peak, activeTab, onDelete, onVisit }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarkVisitedModalOpen, setIsMarkVisitedModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLocationErrorModalOpen, setIsLocationErrorModalOpen] =
    useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");
  const [locationErrorDistance, setLocationErrorDistance] = useState(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(peak.peakId._id);
    setIsDeleteModalOpen(false);
  };

  // Calculate distance between two coordinates in meters using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if user is near the peak before allowing to mark as visited
  const handleMarkVisitedClick = () => {
    if (!navigator.geolocation) {
      setLocationErrorMessage("Vaša naprava ne podpira določanja lokacije.");
      setLocationErrorDistance(null);
      setIsLocationErrorModalOpen(true);
      return;
    }

    setIsCheckingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsCheckingLocation(false);
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Get peak coordinates from populated peakId
        const peakCoordinates = peak.peakId?.location?.coordinates;

        if (!peakCoordinates || peakCoordinates.length !== 2) {
          setLocationErrorMessage(
            "Koordinate vrha niso na voljo. Prosimo, kontaktirajte podporo.",
          );
          setLocationErrorDistance(null);
          setIsLocationErrorModalOpen(true);
          return;
        }

        const [peakLon, peakLat] = peakCoordinates;
        const distance = calculateDistance(userLat, userLon, peakLat, peakLon);

        // Allow marking if within 100 meters of the peak
        const MAX_DISTANCE = 100;
        if (distance <= MAX_DISTANCE) {
          setIsMarkVisitedModalOpen(true);
        } else {
          const distanceKm = (distance / 1000).toFixed(2);
          setLocationErrorMessage(
            "Niste dovolj blizu vrha, da bi ga lahko označili kot osvojenega.",
          );
          setLocationErrorDistance(`${distanceKm} km`);
          setIsLocationErrorModalOpen(true);
        }
      },
      (error) => {
        setIsCheckingLocation(false);
        setLocationErrorDistance(null);
        let errorMsg = "Napaka pri pridobivanju lokacije.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              "Dovoljenje za dostop do lokacije je zavrnjeno. Prosimo, zaprite brskalnik in ob ponovni prijavi omogočite dostop do lokacije.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg =
              "Informacije o lokaciji niso na voljo. Preverite, ali je GPS omogočen.";
            break;
          case error.TIMEOUT:
            errorMsg = "Zahteva za lokacijo je potekla. Poskusite ponovno.";
            break;
        }
        setLocationErrorMessage(errorMsg);
        setIsLocationErrorModalOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleMarkVisitedConfirm = async (pictureFiles) => {
    try {
      const token = localStorage.getItem("token");

      // First, mark peak as visited
      const response = await api.put(
        `/api/checklist/${peak.peakId._id}/visit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Check for new achievements and show notifications
      if (
        response.data.newAchievements &&
        response.data.newAchievements.length > 0
      ) {
        response.data.newAchievements.forEach((achievement) => {
          toast.success(
            <div>
              <p className="font-bold">
                Novi dosežek odklenjen! {achievement.badge}
              </p>
              <p className="text-sm">{achievement.title}</p>
            </div>,
            { duration: 5000 },
          );
        });

        // Dispatch custom event for achievement refresh
        window.dispatchEvent(new CustomEvent("achievementsUpdated"));
      }

      // Update local state
      await onVisit(peak.peakId._id);

      // Then upload pictures if any using FormData
      if (pictureFiles && pictureFiles.length > 0) {
        const formData = new FormData();

        // Append each file to FormData
        pictureFiles.forEach((file) => {
          formData.append("pictures", file);
        });

        await api.put(`/api/checklist/${peak.peakId._id}/pictures`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Slike uspešno naložene!");
      }

      setIsMarkVisitedModalOpen(false);
    } catch (error) {
      console.error("Error marking as visited or uploading pictures:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri obdelavi zahteve",
      );
    }
  };

  // Handle case where peakId might be null (deleted peak)
  if (!peak.peakId) {
    return null;
  }

  return (
    <>
      <tr>
        <td className="font-semibold">{peak.peakId.name}</td>
        <td>{peak.peakId.elevation}</td>
        <td className="hidden md:table-cell">{peak.peakId.mountainRange}</td>
        <td>
          <div className="flex justify-end gap-2">
            {activeTab === "wishlist" && (
              <button
                onClick={handleMarkVisitedClick}
                disabled={isCheckingLocation}
                className="btn btn-sm btn-success gap-1"
              >
                {isCheckingLocation ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="hidden md:inline">Preverjam...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Osvojen</span>
                  </>
                )}
              </button>
            )}
            {activeTab === "visited" && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="btn btn-sm btn-info gap-1"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Deli</span>
              </button>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-sm btn-error"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <DeleteFromChecklistModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        peak={peak}
      />

      <MarkVisitedModal
        isOpen={isMarkVisitedModalOpen}
        onClose={() => setIsMarkVisitedModalOpen(false)}
        onConfirm={handleMarkVisitedConfirm}
        peakName={peak.peakId.name}
      />

      <ShareVisitedPeakModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        peakId={peak.peakId._id}
        peakName={peak.peakId.name}
      />

      <LocationErrorModal
        isOpen={isLocationErrorModalOpen}
        onClose={() => setIsLocationErrorModalOpen(false)}
        errorMessage={locationErrorMessage}
        distance={locationErrorDistance}
      />
    </>
  );
};

export default ChecklistRow;
