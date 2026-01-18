import { useState, useEffect } from "react";

const EditPostModal = ({ isOpen, onClose, onSave, post }) => {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    category: post?.category || "Hike",
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        category: post.category || "Hike",
      });
    }
  }, [post]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Naslov in vsebina sta obvezna!");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Uredi Objavo</h3>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Naslov</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Vnesi naslov objave"
            className="input input-bordered"
            value={formData.title}
            onChange={handleChange}
            maxLength={150}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Kategorija</span>
          </label>
          <select
            name="category"
            className="select select-bordered"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Hike">Pohod</option>
            <option value="Achievement">Dosežek</option>
          </select>
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Vsebina</span>
          </label>
          <textarea
            name="content"
            placeholder="Vnesi vsebino objave"
            className="textarea textarea-bordered h-32"
            value={formData.content}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="modal-action">
          <button onClick={handleSubmit} className="btn btn-primary">
            Shrani
          </button>
          <button onClick={onClose} className="btn">
            Prekliči
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
