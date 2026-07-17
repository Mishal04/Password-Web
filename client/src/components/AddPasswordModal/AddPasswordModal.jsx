import { useState, useEffect } from "react";
import { FiX, FiEye, FiEyeOff, FiRefreshCw, FiStar } from "react-icons/fi";
import "./AddPasswordModal.css";
import { getWebsiteInfo } from "../../utils/websiteInfo";
import { checkPasswordStrength } from "../../utils/passwordStrength";
import API from "../../services/api";

const CATEGORIES = [
  "Social",
  "Email",
  "Work",
  "Shopping",
  "Banking",
  "Entertainment",
  "Development",
  "Other",
];

const STRENGTH_CONFIG = {
  Weak:   { color: "#EF4444", width: "33%",  label: "Weak"   },
  Medium: { color: "#F59E0B", width: "66%",  label: "Medium" },
  Strong: { color: "#22C55E", width: "100%", label: "Strong" },
};

const EMPTY_FORM = {
  website:     "",
  websiteUrl:  "",
  username:    "",
  password:    "",
  category:    "Social",
  notes:       "",
  favorite:    false,
};

/**
 * AddPasswordModal
 *
 * Props:
 *   isOpen        {boolean}
 *   onClose       {function}
 *   onSaveSuccess {function}
 *   editItem      {object|null}  — pass an existing vault item to pre-fill for editing
 *   onToast       {function}     — (message, type?) => void
 */
function AddPasswordModal({ isOpen, onClose, onSaveSuccess, editItem = null, onToast }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);

  /* Pre-fill when editing */
  useEffect(() => {
    if (isOpen && editItem) {
      setFormData({
        website:    editItem.title      || editItem.website || "",
        websiteUrl: editItem.website    || "",
        username:   editItem.username   || "",
        password:   editItem.password   || "",
        category:   editItem.category   || "Social",
        notes:      editItem.notes      || "",
        favorite:   editItem.favorite   ?? false,
      });
    } else if (isOpen) {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    setShowPassword(false);
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  /* ─── Validation ──────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!formData.website.trim())    errs.website    = "Website name is required.";
    if (!formData.websiteUrl.trim()) errs.websiteUrl = "Website URL is required.";
    if (!formData.username.trim())   errs.username   = "Username / Email is required.";
    if (!formData.password.trim())   errs.password   = "Password is required.";
    return errs;
  };

  /* ─── Handlers ────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleGeneratePassword = async () => {
    try {
      const res = await API.get("/vault/generate-password");
      setFormData((prev) => ({ ...prev, password: res.data.password }));
      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
    } catch {
      onToast?.("Unable to generate password.", "error");
    }
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title:    formData.website.trim(),
        website:  formData.websiteUrl.trim(),
        username: formData.username.trim(),
        password: formData.password,
        category: formData.category,
        notes:    formData.notes.trim(),
        favorite: formData.favorite,
      };

      if (editItem) {
        await API.put(`/vault/${editItem._id}`, payload);
        onToast?.("Password updated successfully!");
      } else {
        await API.post("/vault", payload);
        onToast?.("Password saved successfully!");
      }

      onSaveSuccess?.();
      onClose();
    } catch (err) {
      onToast?.(err.response?.data?.message || "Failed to save password.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Derived ─────────────────────────────────── */
  const websiteInfo  = getWebsiteInfo(formData.websiteUrl);
  const { label: strengthLabel, score } = formData.password
    ? checkPasswordStrength(formData.password)
    : { label: "Weak", score: 0 };
  const sc = STRENGTH_CONFIG[strengthLabel] || STRENGTH_CONFIG.Weak;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* ── Header ── */}
        <div className="modal-header">
          <h2 id="modal-title">
            {editItem ? "Edit Password" : "Add New Password"}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <div className="form-grid">
            {/* Website Name */}
            <div className="form-group">
              <label htmlFor="modal-website">Website Name</label>
              <input
                id="modal-website"
                type="text"
                name="website"
                placeholder="Instagram"
                value={formData.website}
                onChange={handleChange}
                className={errors.website ? "input-error" : ""}
              />
              {errors.website && <span className="field-error">{errors.website}</span>}
            </div>

            {/* Website URL */}
            <div className="form-group">
              <label htmlFor="modal-websiteUrl">Website URL</label>
              <input
                id="modal-websiteUrl"
                type="text"
                name="websiteUrl"
                placeholder="https://instagram.com"
                value={formData.websiteUrl}
                onChange={handleChange}
                className={errors.websiteUrl ? "input-error" : ""}
              />
              {errors.websiteUrl && <span className="field-error">{errors.websiteUrl}</span>}

              {formData.websiteUrl && (
                <div className="website-preview">
                  <img
                    src={websiteInfo.favicon}
                    alt={websiteInfo.title}
                    className="website-logo"
                    onError={(e) => {
                      // Stage 1 → Google S2
                      if (websiteInfo.faviconFallback && e.target.src !== websiteInfo.faviconFallback) {
                        e.target.src = websiteInfo.faviconFallback;
                        return;
                      }
                      // Stage 2 → site's own /favicon.ico
                      if (websiteInfo.faviconDirect && e.target.src !== websiteInfo.faviconDirect) {
                        e.target.src = websiteInfo.faviconDirect;
                        return;
                      }
                      // Stage 3 → hide
                      e.target.style.display = "none";
                    }}
                  />
                  <span>{websiteInfo.title || formData.websiteUrl}</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="modal-username">Username / Email</label>
              <input
                id="modal-username"
                type="text"
                name="username"
                placeholder="user@example.com"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="modal-category">Category</label>
              <select
                id="modal-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="modal-password">Password</label>
            <div className={`password-input ${errors.password ? "input-error-wrap" : ""}`}>
              <input
                id="modal-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter or generate a password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              <button
                type="button"
                onClick={handleGeneratePassword}
                title="Generate strong password"
                aria-label="Generate password"
              >
                <FiRefreshCw />
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}

            {/* Strength indicator */}
            {formData.password && (
              <div className="strength-indicator">
                <div className="strength-track">
                  <div
                    className="strength-fill"
                    style={{ width: sc.width, background: sc.color }}
                  />
                </div>
                <span className="strength-text" style={{ color: sc.color }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="modal-notes">Notes</label>
            <textarea
              id="modal-notes"
              rows="3"
              name="notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Favorite */}
          <div className="form-group form-group--inline">
            <label className="checkbox-label" htmlFor="modal-favorite">
              <input
                id="modal-favorite"
                type="checkbox"
                name="favorite"
                checked={formData.favorite}
                onChange={handleChange}
              />
              <span className="checkbox-custom">
                <FiStar size={12} />
              </span>
              <span>Mark as Favourite</span>
            </label>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="save-btn" type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editItem ? "Update Password" : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPasswordModal;
