import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";

const MarkVisitedModal = ({ isOpen, onClose, onConfirm, peakName }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    // Filter for allowed image types (JPEG, PNG, WebP)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert("Samo JPEG, PNG in WebP slike so dovoljene");
      return;
    }

    // Check file sizes (max 10MB each)
    const oversizedFiles = validFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      alert("Maksimalna velikost slike je 10MB");
      return;
    }

    // Calculate how many slots are available
    const availableSlots = 3 - selectedFiles.length;

    // Take only the first N files that fit in available slots
    const filesToAdd = validFiles.slice(0, availableSlots);

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);

    // Create previews
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onConfirm(selectedFiles);
    handleClose();
  };

  const handleClose = () => {
    // Clean up previews
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setSelectedFiles([]);
    setPreviews([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Peak Name */}
        <div className="mb-4">
          <p className="text-lg font-semibold text-center">{peakName}</p>
        </div>

        {/* Encouraging Message */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            Naloži do 3 slike iz svojega pohoda in ohrani spomine za kasneje! 📸
          </p>
        </div>

        {/* Image Upload Area */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload buttons for remaining slots */}
            {Array.from({ length: Math.max(0, 3 - previews.length) }).map(
              (_, index) => (
                <button
                  key={`upload-${index}`}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  disabled={previews.length >= 3}
                >
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Dodaj</span>
                </button>
              ),
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <button onClick={handleSave} className="btn btn-success">
            Označi kot osvojen
          </button>
          <button onClick={handleClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkVisitedModal;
