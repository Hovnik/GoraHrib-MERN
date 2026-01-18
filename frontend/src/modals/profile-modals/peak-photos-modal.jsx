import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

const PeakPhotosModal = ({ isOpen, onClose, peak }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !peak) return null;

  const hasPictures = peak.pictures && peak.pictures.length > 0;

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? peak.pictures.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === peak.pictures.length - 1 ? 0 : prev + 1
    );
  };

  if (!hasPictures) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[100] btn btn-circle btn-ghost text-white hover:bg-white hover:bg-opacity-20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={peak.pictures[currentIndex]}
          alt={`${peak.peakId?.name} - slika ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows */}
        {peak.pictures.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white bg-opacity-20 hover:bg-opacity-40 border-none text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white bg-opacity-20 hover:bg-opacity-40 border-none text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {peak.pictures.length}
        </div>
      </div>
    </div>
  );
};

export default PeakPhotosModal;
