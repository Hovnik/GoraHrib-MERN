import { useState, useEffect } from "react";
import { User, Camera, Minus } from "lucide-react";
import axios from "axios";
import ProfilePictureCropModal from "./profile-picture-crop-modal";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    attribute: "",
    value: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")),
  );

  // Fetch current user data when modal opens
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:3000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCurrentUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
        });
    }
  }, [isOpen]);

  const storedUser = currentUser;

  const avatarSrc =
    (profilePicture instanceof File
      ? URL.createObjectURL(profilePicture)
      : null) ||
    storedUser?.profilePicture?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      storedUser?.username || "User",
    )}&size=200&background=22c55e&color=fff`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Slika je prevelika. Največja velikost je 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      };
    }
  };

  const handleCropComplete = (croppedImageFile, crop) => {
    // Store the File object and create object URL for preview
    setProfilePicture(croppedImageFile);
    setCropData(crop);
  };

  const handleDeleteProfilePicture = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete("http://localhost:3000/api/user/profile-picture", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfilePicture(null);
      setCropData(null);

      // Refresh user data
      const userRes = await axios.get("http://localhost:3000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(userRes.data.user));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.error("Napaka pri brisanju slike profila");
    }
  };

  const handleSaveProfile = async (formData) => {
    const token = localStorage.getItem("token");
    try {
      // Upload profile picture if changed
      if (profilePicture && cropData) {
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);
        formData.append("crop", JSON.stringify(cropData));

        await axios.put(
          "http://localhost:3000/api/user/profile-picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }

      if (formData.username && formData.username.length > 20) {
        toast.error("Uporabniško ime ne sme biti daljše od 20 znakov");
        return;
      }

      // Update username if changed
      if (formData.username && formData.username.trim()) {
        const newUsername = formData.username.trim();

        // If username changed, check availability
        if (newUsername !== storedUser?.username) {
          const searchRes = await axios.get(
            `http://localhost:3000/api/user/search?q=${encodeURIComponent(
              newUsername,
            )}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (searchRes.data?.users?.length > 0) {
            toast.error("Uporabniško ime je že zasedeno");
            return;
          }
        }

        await axios.put(
          `http://localhost:3000/api/user/username`,
          { value: newUsername },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // Refresh user data
      const userRes = await axios.get("http://localhost:3000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(userRes.data.user));

      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Napaka pri posodabljanju profila",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ProfilePictureCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />

      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Uredi Profil</h3>

          {/* Profile Picture Preview */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={avatarSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Camera button overlay */}
              <label className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
              {/* Delete button overlay */}
              {(profilePicture || storedUser?.profilePicture?.url) && (
                <button
                  onClick={handleDeleteProfilePicture}
                  className="absolute bottom-0 left-0 btn btn-circle btn-sm btn-error"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Uporabniško Ime</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder={storedUser?.username || ""}
              className="input input-bordered"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="modal-action justify-center">
            <button
              onClick={() => handleSaveProfile(formData)}
              className="btn btn-primary"
            >
              Shrani
            </button>
            <button onClick={onClose} className="btn">
              Prekliči
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
