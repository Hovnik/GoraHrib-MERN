import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@mui/material";
import { Camera, ZoomIn } from "lucide-react";

const ProfilePictureCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage, { x: crop.x, y: crop.y, zoom });
      handleClose();
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="modal modal-open" style={{ zIndex: 9999 }}>
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Prilagodi Sliko Profila
        </h3>

        {/* Crop Area */}
        <div className="relative w-full aspect-square max-h-[500px] bg-gray-900 rounded-lg mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Zoom Control - Desktop only */}
        {!isMobile && (
          <div className="mb-6 px-4">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Povečava
              </span>
            </label>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, value) => setZoom(value)}
              sx={{
                color: "oklch(var(--p))",
                "& .MuiSlider-thumb": {
                  backgroundColor: "oklch(var(--p))",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "oklch(var(--p))",
                },
              }}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mb-4">
          Povleci sliko za prilagoditev položaja
        </div>

        {/* Action Buttons */}
        <div className="modal-action justify-center">
          <button onClick={createCroppedImage} className="btn btn-primary">
            Uporabi
          </button>
          <button onClick={handleClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to crop the image
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Convert to File object
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas is empty");
        return;
      }
      // Create a File object from the blob
      const file = new File([blob], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      resolve(file);
    }, "image/jpeg");
  });
};

// Helper to create image from src
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export default ProfilePictureCropModal;
