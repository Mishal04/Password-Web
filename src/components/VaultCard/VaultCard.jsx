import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiCopy,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiUser,
} from "react-icons/fi";
import "./VaultCard.css";
import { getWebsiteInfo } from "../../utils/websiteInfo";
import { checkPasswordStrength } from "../../utils/passwordStrength";
import API from "../../services/api";

const CATEGORY_COLORS = {
  Social:        { bg: "rgba(99,102,241,0.12)",  text: "#818CF8" },
  Email:         { bg: "rgba(16,185,129,0.12)",  text: "#34D399" },
  Work:          { bg: "rgba(245,158,11,0.12)",  text: "#FBBF24" },
  Shopping:      { bg: "rgba(236,72,153,0.12)",  text: "#F472B6" },
  Banking:       { bg: "rgba(59,130,246,0.12)",  text: "#60A5FA" },
  Entertainment: { bg: "rgba(168,85,247,0.12)",  text: "#C084FC" },
  Development:   { bg: "rgba(20,184,166,0.12)",  text: "#2DD4BF" },
  Personal:      { bg: "rgba(139,92,246,0.12)",  text: "#A78BFA" },
  Other:         { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF" },
};

const STRENGTH_CONFIG = {
  Weak:   { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   width: "33%"  },
  Medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  width: "66%"  },
  Strong: { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   width: "100%" },
};

function VaultCard({ item, onActionSuccess, onToast, onEdit }) {
  const [visible, setVisible] = useState(false);

  const info      = getWebsiteInfo(item.website);
  const strength  = item.strength || checkPasswordStrength(item.password).label;
  const sc        = STRENGTH_CONFIG[strength] || STRENGTH_CONFIG.Weak;
  const catColor  = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
      })
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.password);
      onToast?.("Password copied to clipboard!");
    } catch {
      onToast?.("Failed to copy password.", "error");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await API.patch(`/vault/favorite/${item._id}`);
      onActionSuccess?.();
    } catch {
      onToast?.("Failed to update favorite.", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete password for "${item.title || item.website}"?`)) return;
    try {
      await API.delete(`/vault/${item._id}`);
      onActionSuccess?.();
      onToast?.("Password deleted.");
    } catch {
      onToast?.("Failed to delete password.", "error");
    }
  };

  return (
    <div className={`vault-card ${item.favorite ? "vault-card--favorite" : ""}`}>
      {/* Favorite ribbon */}
      {item.favorite && <div className="vault-card__ribbon" aria-label="Favorite">★</div>}

      {/* Top row: favicon + name + category */}
      <div className="vault-card__top">
        <div className="vault-card__logo-wrap">
          {info.favicon ? (
            <img
              src={info.favicon}
              alt={info.title}
              className="vault-card__logo"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="vault-card__logo-fallback"
            style={{ display: info.favicon ? "none" : "flex" }}
          >
            {(item.title || item.website || "?").charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="vault-card__site-info">
          <h3 className="vault-card__site-name">
            {item.title || info.title || item.website}
          </h3>
          {info.domain && (
            <span className="vault-card__domain">{info.domain}</span>
          )}
        </div>

        <span
          className="vault-card__category"
          style={{ background: catColor.bg, color: catColor.text }}
        >
          <FiTag size={11} />
          {item.category}
        </span>
      </div>

      {/* Username row */}
      <div className="vault-card__row">
        <FiUser className="vault-card__row-icon" />
        <span className="vault-card__row-label">Username</span>
        <span className="vault-card__row-value vault-card__username">
          {item.username || <span className="vault-card__empty">—</span>}
        </span>
      </div>

      {/* Password row */}
      <div className="vault-card__row vault-card__row--password">
        <div className="vault-card__password-left">
          <span className="vault-card__row-label">Password</span>
          <span className="vault-card__password-value font-mono">
            {visible ? item.password : "••••••••••••"}
          </span>
        </div>
        <div className="vault-card__password-actions">
          <button
            className="vault-card__icon-btn"
            onClick={() => setVisible((v) => !v)}
            title={visible ? "Hide password" : "Show password"}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
          <button
            className="vault-card__icon-btn"
            onClick={handleCopy}
            title="Copy password"
            aria-label="Copy password"
          >
            <FiCopy size={15} />
          </button>
        </div>
      </div>

      {/* Strength bar */}
      <div className="vault-card__strength">
        <div className="vault-card__strength-track">
          <div
            className="vault-card__strength-fill"
            style={{ width: sc.width, background: sc.color }}
          />
        </div>
        <span
          className="vault-card__strength-label"
          style={{ color: sc.color, background: sc.bg }}
        >
          {strength}
        </span>
      </div>

      {/* Footer: date + actions */}
      <div className="vault-card__footer">
        {formattedDate && (
          <span className="vault-card__date">
            <FiCalendar size={12} />
            {formattedDate}
          </span>
        )}

        <div className="vault-card__actions">
          <button
            className={`vault-card__action-btn ${item.favorite ? "vault-card__action-btn--fav-active" : ""}`}
            onClick={handleToggleFavorite}
            title={item.favorite ? "Remove from favorites" : "Add to favorites"}
            aria-label="Toggle favorite"
          >
            <FiStar
              size={15}
              style={{
                fill:  item.favorite ? "#FFC107" : "none",
                color: item.favorite ? "#FFC107" : "inherit",
              }}
            />
          </button>

          <button
            className="vault-card__action-btn"
            onClick={() => onEdit?.(item)}
            title="Edit"
            aria-label="Edit password"
          >
            <FiEdit2 size={15} />
          </button>

          <button
            className="vault-card__action-btn vault-card__action-btn--danger"
            onClick={handleDelete}
            title="Delete"
            aria-label="Delete password"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VaultCard;
