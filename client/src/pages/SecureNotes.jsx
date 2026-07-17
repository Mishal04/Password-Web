import { useState, useEffect, useCallback } from "react";
import "./SecureNotes.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import API from "../services/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import { BsPin, BsPinFill } from "react-icons/bs";

const NOTE_COLORS = [
  "#fffae6",
  "#e8f5e9",
  "#e3f2fd",
  "#fce4ec",
  "#f3e5f5",
  "#fff3e0",
  "#e0f7fa",
  "#f1f8e9",
  "#fbe9e7",
  "#ede7f6",
];

function SecureNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [colored, setColored] = useState("#fffae6");

  // Stabilised with useCallback so the effect dependency array can include it
  // without causing an infinite loop — fixes exhaustive-deps.
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes", {
        params: { search: searchQuery },
      });
      if (res.data && res.data.success) {
        setNotes(res.data.notes);
      }
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Open modal for Add / Edit
  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setColored(note.colored || "#fffae6");
    } else {
      setEditingNote(null);
      setTitle("");
      setContent("");
      setColored("#fffae6");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setColored("#fffae6");
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (editingNote) {
        await API.put(`/notes/${editingNote._id}`, { title, content, colored });
      } else {
        await API.post("/notes", { title, content, colored });
      }
      await fetchNotes();
      closeModal();
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      await fetchNotes();
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  // Toggle pin
  const handleTogglePin = async (id) => {
    try {
      await API.patch(`/notes/${id}/pin`);
      await fetchNotes();
    } catch (err) {
      console.error("Failed to toggle pin", err);
    }
  };

  // Separate pinned from unpinned
  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="secure-notes-layout">
      <Sidebar />

      <div className="secure-notes-main">
        <Header />

        <div className="secure-notes-content">
          {/* Toolbar */}
          <div className="notes-toolbar">
            <h2 className="notes-page-title">Secure Notes</h2>
            <div className="notes-toolbar-right">
              <div className="notes-search-box">
                <FiSearch className="notes-search-icon" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="add-note-btn" onClick={() => openModal()}>
                <FiPlus /> Add Note
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && <p className="notes-loading">Loading notes...</p>}

          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <>
              <p className="notes-section-label">📌 Pinned</p>
              <div className="notes-masonry">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={() => openModal(note)}
                    onDelete={() => handleDelete(note._id)}
                    onTogglePin={() => handleTogglePin(note._id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Others Section */}
          {otherNotes.length > 0 && (
            <>
              {pinnedNotes.length > 0 && (
                <p className="notes-section-label">Others</p>
              )}
              <div className="notes-masonry">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={() => openModal(note)}
                    onDelete={() => handleDelete(note._id)}
                    onTogglePin={() => handleTogglePin(note._id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && notes.length === 0 && (
            <div className="notes-empty">
              <p>No notes yet. Click <strong>Add Note</strong> to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="note-modal-backdrop" onClick={closeModal}>
          <div
            className="note-modal"
            style={{ backgroundColor: colored }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="note-modal-close" onClick={closeModal}>
              <FiX />
            </button>
            <h3>{editingNote ? "Edit Note" : "New Note"}</h3>
            <input
              type="text"
              className="note-modal-title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="note-modal-content"
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
            <div className="note-color-picker">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-dot${colored === c ? " selected" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColored(c)}
                />
              ))}
            </div>
            <div className="note-modal-actions">
              <button className="note-save-btn" onClick={handleSave}>
                {editingNote ? "Update" : "Save"}
              </button>
              <button className="note-cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Note Card sub-component ----
function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  return (
    <div
      className="note-card"
      style={{ backgroundColor: note.colored || "#fffae6" }}
    >
      <div className="note-card-header">
        <h4 className="note-card-title">{note.title || "Untitled"}</h4>
        <button
          className="note-pin-btn"
          onClick={onTogglePin}
          title={note.pinned ? "Unpin" : "Pin"}
        >
          {note.pinned ? <BsPinFill /> : <BsPin />}
        </button>
      </div>
      <p className="note-card-content">{note.content}</p>
      <div className="note-card-footer">
        <span className="note-card-date">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        <div className="note-card-actions">
          <button onClick={onEdit} title="Edit">
            <FiEdit2 />
          </button>
          <button onClick={onDelete} title="Delete">
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecureNotes;
