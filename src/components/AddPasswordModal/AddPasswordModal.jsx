import { useState } from "react";
import {
  FiX,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from "react-icons/fi";

import "./AddPasswordModal.css";
import { getWebsiteInfo } from "../../utils/websiteInfo";
import API from "../../services/api";

function AddPasswordModal({ isOpen, onClose, onSaveSuccess }) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    website: "",
    title: "",
    username: "",
    password: "",
    category: "Personal",
    notes: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "website") {
      const info = getWebsiteInfo(value);

      setFormData((prev) => ({
        ...prev,
        website: value,
        title: prev.title || info.title,
      }));

      return;
    }

    if (name === "title") {
      // Auto-fill website URL from title as user types
      const cleaned = value.trim().toLowerCase().replace(/\s+/g, "");
      setFormData((prev) => ({
        ...prev,
        title: value,
        website: cleaned ? `https://${cleaned}.com` : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleGeneratePassword = async () => {
    try {
      const res = await API.get("/vault/generate-password");

      setFormData((prev) => ({
        ...prev,
        password: res.data.password,
      }));
    } catch (err) {
      console.error(err);

      alert("Unable to generate password.");
    }
  };

  const handleSave = async () => {
    if (!formData.website || !formData.password) {
      alert("Please fill in Website and Password fields.");
      return;
    }
    try {
      await API.post("/vault", formData);
      setFormData({
        website: "",
        title: "",
        username: "",
        password: "",
        category: "Personal",
        notes: "",
      });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save password.");
    }
  };

  const websiteInfo = getWebsiteInfo(formData.website);

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Add New Password</h2>
          <button
            className="close-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-grid">
            {/* Title */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Instagram"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Website URL */}
            <div className="form-group">
              <label>Website URL</label>
              <input
                type="text"
                name="website"
                placeholder="https://instagram.com"
                value={formData.website}
                onChange={handleChange}
              />

              {formData.website && (
                <div className="website-preview">
                  <img
                    src={websiteInfo.favicon}
                    alt={websiteInfo.title}
                    className="website-logo"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span>{websiteInfo.title}</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="form-group">
              <label>Username / Email</label>
              <input
                type="text"
                name="username"
                placeholder="developer@gmail.com"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Personal</option>
                <option>Work</option>
                <option>Social</option>
                <option>Banking</option>
                <option>Shopping</option>
                <option>Entertainment</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

              <button
                type="button"
                onClick={handleGeneratePassword}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows="4"
              name="notes"
              placeholder="Optional Notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="save-btn"
              type="button"
              onClick={handleSave}
            >
              Save Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPasswordModal;