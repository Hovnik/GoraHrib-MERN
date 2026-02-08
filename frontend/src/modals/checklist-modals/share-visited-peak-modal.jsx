import { useState, useEffect } from "react";
import { X, Share2 } from "lucide-react";
import api from "../../config/axios";
import toast from "react-hot-toast";

const ShareVisitedPeakModal = ({ isOpen, onClose, peakId, peakName }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pictures, setPictures] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPictures = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch checklist to get pictures for this peak
        const response = await api.get("/api/checklist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const peak = response.data.checklist.find(
          (item) => item.peakId._id === peakId,
        );

        if (peak && peak.pictures && peak.pictures.length > 0) {
          setPictures(peak.pictures);
          // Pre-select all pictures by default
          setSelectedPictures(new Set(peak.pictures.map((_, index) => index)));
        } else {
          setPictures([]);
          setSelectedPictures(new Set());
        }
      } catch (error) {
        console.error("Error fetching peak pictures:", error);
        setPictures([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && peakId) {
      loadPictures();
      // Auto-populate title with peak name
      setTitle(`Osvojil sem ${peakName}!`);
    }
  }, [isOpen, peakId, peakName]);

  const togglePictureSelection = (index) => {
    setSelectedPictures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    if (!title.trim()) {
      toast.error("Naslov je obvezen");
      return;
    }

    if (!content.trim()) {
      toast.error("Vsebina je obvezna");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      // Get only the selected pictures
      const picturesToShare = pictures.filter((_, index) =>
        selectedPictures.has(index),
      );

      const postData = {
        title: title.trim(),
        content: content.trim(),
        category: "Hike",
        pictures: picturesToShare,
        peakId: peakId,
      };

      await api.post("/api/forum", postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      handleClose();
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri deljenju objave",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setPictures([]);
    setSelectedPictures(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Deli svoj pohod!
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Peak Name Display */}
        <div className="mb-4 p-3 bg-base-200 rounded-lg">
          <p className="text-sm text-gray-600">Vrh</p>
          <p className="font-semibold">{peakName}</p>
        </div>

        {/* Title Input */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">
              Naslov <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Naslov objave..."
            className="input input-bordered w-full"
            maxLength={100}
            disabled={isSubmitting}
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              {title.length}/100 znakov
            </span>
          </label>
        </div>

        {/* Content Input */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">
              Vsebina <span className="text-error">*</span>
            </span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Opiši svojo izkušnjo na tem vrhu..."
            className="textarea textarea-bordered w-full h-32"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              {content.length}/1000 znakov
            </span>
          </label>
        </div>

        {/* Pictures Section */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : pictures.length > 0 ? (
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">Slike iz pohoda</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {pictures.map((picture, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer group"
                  onClick={() => togglePictureSelection(index)}
                >
                  <img
                    src={picture}
                    alt={`Peak photo ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg border-2 transition-all ${
                      selectedPictures.has(index)
                        ? "border-success opacity-100"
                        : "border-gray-300 opacity-50"
                    }`}
                  />
                  {selectedPictures.has(index) && (
                    <div className="absolute top-2 right-2 bg-success text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Izbrane slike: {selectedPictures.size} / {pictures.length}
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-base-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Ni slik za ta vrh. Slike lahko dodaš pri označevanju vrha kot
              obiskanega.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleShare}
            className="btn btn-info gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Objavljam...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Objavi
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareVisitedPeakModal;
