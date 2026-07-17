import { useEffect } from "react";
import { FiCheck, FiX, FiInfo } from "react-icons/fi";
import "./Toast.css";

// Moved to module scope — these are pure constants that use no component
// state, so they only need to be allocated once (fixes prefer-module-scope-static-value).
const ICONS = {
  success: <FiCheck size={15} />,
  error:   <FiX    size={15} />,
  info:    <FiInfo  size={15} />,
};

/**
 * Toast — lightweight notification popup.
 *
 * Props:
 *   message  {string}           — text to display
 *   type     {"success"|"error"|"info"} — visual variant (default "success")
 *   onClose  {function}         — called after duration elapses or on dismiss
 *   duration {number}           — auto-dismiss ms (default 2800)
 */
function Toast({ message, type = "success", onClose, duration = 2800 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <span className="toast__icon">{ICONS[type] ?? ICONS.success}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss">
        <FiX size={13} />
      </button>
    </div>
  );
}

export default Toast;
