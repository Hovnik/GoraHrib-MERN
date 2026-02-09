import { useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import api from "../../config/axios";
import toast from "react-hot-toast";

const AddPicturesModal = ({
  isOpen,
  onClose,
  peakId,
  peakName,
  existingPictures = [],
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [keptExistingPictures, setKeptExistingPictures] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load existing pictures when modal opens
  useEffect(() => {
    if (isOpen && existingPictures.length > 0) {
      // Set previews to existing picture URLs (up to 3)
      setPreviews(existingPictures.slice(0, 3));
      // Track which existing pictures are kept
      setKeptExistingPictures(existingPictures.slice(0, 3));
      // No selected files initially since these are already uploaded
      setSelectedFiles([]);
    }
  }, [isOpen, existingPictures]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    // Filter for allowed image types (JPEG, PNG, WebP)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      toast.error("Samo JPEG, PNG in WebP slike so dovoljene");
      return;
    }

    // Check file sizes (max 10MB each)
    const oversizedFiles = validFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      toast.error("Maksimalna velikost slike je 10MB");
      return;
    }

    // Calculate how many slots are available (total 3 slots minus existing pictures and new files)
    const availableSlots = 3 - previews.length;

    // Take only the first N files that fit in available slots
    const filesToAdd = validFiles.slice(0, availableSlots);

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);

    // Create previews for new files
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const preview = previews[index];

    // Check if this is a blob URL (newly selected file) or existing URL
    const isNewFile = preview.startsWith("blob:");

    if (isNewFile) {
      // Remove from selected files
      const newFileStartIndex = keptExistingPictures.length;
      const fileIndex = index - newFileStartIndex;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      URL.revokeObjectURL(preview);
    } else {
      // Remove from kept existing pictures
      setKeptExistingPictures((prev) => prev.filter((url) => url !== preview));
    }

    // Remove from previews regardless of type
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    // Check if there are any changes
    const hasChanges =
      selectedFiles.length > 0 ||
      keptExistingPictures.length !== existingPictures.length;

    if (!hasChanges) {
      toast.error("Ni sprememb za shranitev");
      return;
    }

    // Check if total pictures would exceed limit
    if (keptExistingPictures.length + selectedFiles.length > 3) {
      toast.error("Maksimalno 3 slike so dovoljene");
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append each new file to FormData
      selectedFiles.forEach((file) => {
        formData.append("pictures", file);
      });

      // Append existing pictures to keep as JSON string
      formData.append("existingPictures", JSON.stringify(keptExistingPictures));

      await api.put(`/api/checklist/${peakId}/pictures`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Slike uspešno posodobljene!");
      handleClose();
    } catch (error) {
      console.error("Error uploading pictures:", error);
      toast.error(error.response?.data?.message || "Napaka pri nalaganju slik");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up only blob URLs (newly selected files)
    previews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });
    setSelectedFiles([]);
    setPreviews([]);
    setKeptExistingPictures([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Peak Name */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-center">Dodaj Slike</h3>
          <p className="text-center text-gray-600">{peakName}</p>
        </div>

        {/* Encouraging Message */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            {existingPictures.length > 0
              ? `Dodaj nove slike ali zamenjaj obstoječe (${previews.length}/3) 📸`
              : "Naloži do 3 slike iz svojega pohoda in ohrani spomine za kasneje! 📸"}
          </p>
        </div>

        {/* Image Upload Area */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {previews.map((preview, index) => {
              const isExisting =
                index < existingPictures.length &&
                existingPictures.includes(preview);
              return (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = "none";
                      console.error("Failed to load image:", preview);
                    }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {isExisting && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-75 text-white text-xs py-0.5 text-center rounded-b-lg">
                      Naloženo
                    </div>
                  )}
                </div>
              );
            })}

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
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn btn-primary"
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Posodabljam...
              </>
            ) : (
              "Shrani Spremembe"
            )}
          </button>
          <button onClick={handleClose} disabled={isUploading} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPicturesModal;
