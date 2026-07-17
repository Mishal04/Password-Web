import { useState } from "react";
import "./PasswordTable.css";
import {
  FiEye,
  FiEyeOff,
  FiCopy,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
} from "react-icons/fi";
import API from "../../services/api";
import { getWebsiteInfo } from "../../utils/websiteInfo";

function PasswordTable({ passwords = [], onActionSuccess }) {
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    website: "",
    username: "",
    password: "",
    category: "Personal",
  });

  const toggleVisibility = (id) => {
    const next = new Set(visiblePasswords);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setVisiblePasswords(next);
  };

  const handleCopy = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      alert("Password copied to clipboard!");
    } catch (err) {
      alert("Failed to copy password.");
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await API.patch(`/vault/favorite/${id}`);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert("Failed to update favorite status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this password?")) return;
    try {
      await API.delete(`/vault/${id}`);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert("Failed to delete password.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      website: item.website,
      username: item.username,
      password: item.password,
      category: item.category || "Personal",
    });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await API.put(`/vault/${id}`, editData);
      setEditingId(null);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="password-table">
      <div className="table-header">
        <span>Website</span>
        <span>Username</span>
        <span>Category</span>
        <span>Password</span>
        <span>Actions</span>
      </div>

      {passwords.length === 0 ? (
        <div className="table-row empty-row">
          <span style={{ gridColumn: "span 5", textAlign: "center", color: "var(--text-secondary)" }}>
            No credentials saved yet. Click "Add Password" to get started.
          </span>
        </div>
      ) : (
        passwords.map((item) => {
          const isEditing = editingId === item._id;
          const isVisible = visiblePasswords.has(item._id);

          return (
            <div className="table-row" key={item._id}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="website"
                    value={editData.website}
                    onChange={handleEditChange}
                    className="table-edit-input"
                  />
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleEditChange}
                    className="table-edit-input"
                  />
                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    className="table-edit-select"
                  >
                    <option>Personal</option>
                    <option>Work</option>
                    <option>Social</option>
                    <option>Banking</option>
                    <option>Shopping</option>
                    <option>Entertainment</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="text"
                    name="password"
                    value={editData.password}
                    onChange={handleEditChange}
                    className="table-edit-input"
                  />
                  <div className="actions">
                    <button onClick={() => handleSaveEdit(item._id)} title="Save">
                      <FiCheck />
                    </button>
                    <button onClick={() => setEditingId(null)} title="Cancel">
                      <FiX />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="table-text website-cell" data-label="Website">
                    {getWebsiteInfo(item.website).favicon ? (
                      <img
                        src={getWebsiteInfo(item.website).favicon}
                        alt=""
                        className="table-website-icon"
                        onError={(e) => {
                          const info = getWebsiteInfo(item.website);
                          // Stage 1 → Google S2
                          if (info.faviconFallback && e.target.src !== info.faviconFallback) {
                            e.target.src = info.faviconFallback;
                            return;
                          }
                          // Stage 2 → site's own /favicon.ico
                          if (info.faviconDirect && e.target.src !== info.faviconDirect) {
                            e.target.src = info.faviconDirect;
                            return;
                          }
                          // Stage 3 → hide
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="table-website-icon-placeholder">🌐</span>
                    )}
                    <span>{item.title || item.website}</span>
                  </span>
                  <span className="table-text" data-label="Username">{item.username}</span>
                  <span className="table-text category-badge" data-label="Category">{item.category}</span>
                  <span className="table-text font-mono" data-label="Password">
                    {isVisible ? item.password : "••••••••••"}
                  </span>
                  <div className="actions">
                    <button onClick={() => toggleVisibility(item._id)} title={isVisible ? "Hide" : "Show"}>
                      {isVisible ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button onClick={() => handleCopy(item.password)} title="Copy">
                      <FiCopy />
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(item._id)}
                      className={item.favorite ? "fav-active" : ""}
                      title="Favorite"
                    >
                      <FiStar style={{ fill: item.favorite ? "#FFC107" : "none", color: item.favorite ? "#FFC107" : "inherit" }} />
                    </button>
                    <button onClick={() => startEdit(item)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(item._id)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PasswordTable;