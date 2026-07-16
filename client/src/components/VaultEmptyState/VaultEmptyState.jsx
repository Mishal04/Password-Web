import { FiPlus, FiLock } from "react-icons/fi";
import "./VaultEmptyState.css";

function VaultEmptyState({ onAddPassword }) {
  return (
    <div className="empty-state">
      {/* Illustration */}
      <div className="empty-state__illustration" aria-hidden="true">
        <div className="empty-state__circle empty-state__circle--outer" />
        <div className="empty-state__circle empty-state__circle--inner" />
        <div className="empty-state__icon-wrap">
          <FiLock className="empty-state__icon" />
        </div>

        {/* Floating decorations */}
        <div className="empty-state__dot empty-state__dot--1" />
        <div className="empty-state__dot empty-state__dot--2" />
        <div className="empty-state__dot empty-state__dot--3" />
      </div>

      <h2 className="empty-state__title">No passwords stored yet</h2>
      <p className="empty-state__subtitle">
        Keep all your logins safe and organised in one encrypted vault.
        <br />
        Add your first password to get started.
      </p>

      <button className="empty-state__btn" onClick={onAddPassword}>
        <FiPlus size={18} />
        Add First Password
      </button>
    </div>
  );
}

export default VaultEmptyState;
