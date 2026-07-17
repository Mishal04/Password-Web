import { useState, useEffect, useCallback, useMemo } from "react";
import { FiLock } from "react-icons/fi";

// Moved to module scope so React does not recreate the component type on every
// Vault render — fixes no-nested-component-definition / no-unstable-nested-components.
function SkeletonCard() {
  return (
    <div className="vault-skeleton-card">
      <div className="vault-skeleton-card__top">
        <div className="vault-skeleton__circle" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="vault-skeleton__line vault-skeleton__line--short" />
          <div className="vault-skeleton__line vault-skeleton__line--xs"    />
        </div>
      </div>
      <div className="vault-skeleton__line vault-skeleton__line--full" />
      <div className="vault-skeleton__line vault-skeleton__line--med"  />
      <div className="vault-skeleton__line vault-skeleton__line--short" />
    </div>
  );
}

import Sidebar           from "../components/Sidebar/Sidebar";
import Header            from "../components/Header/Header";
import VaultToolbar      from "../components/VaultToolbar/VaultToolbar";
import VaultCard         from "../components/VaultCard/VaultCard";
import VaultEmptyState   from "../components/VaultEmptyState/VaultEmptyState";
import AddPasswordModal  from "../components/AddPasswordModal/AddPasswordModal";
import Toast             from "../components/Toast/Toast";

import API from "../services/api";
import "./Vault.css";
import "./Dashboard.css"; // reuse .dashboard + .dashboard-content layout shell

function Vault() {
  /* ─── State ─────────────────────────────────────── */
  const [passwords,      setPasswords]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortOrder,      setSortOrder]      = useState("latest");
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editItem,       setEditItem]       = useState(null);

  /* Toast */
  const [toast, setToast] = useState({ message: "", type: "success" });
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);
  const closeToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  /* ─── Data fetching ──────────────────────────────── */
  const fetchPasswords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/vault");
      if (res.data?.success) {
        setPasswords(res.data.vaults);
      }
    } catch (err) {
      showToast("Failed to load passwords.", "error");
      console.error("Vault fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  /* ─── Client-side filter + sort ─────────────────── */
  const filteredPasswords = useMemo(() => {
    let list = [...passwords];

    // Search
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(kw)    ||
          p.website?.toLowerCase().includes(kw)  ||
          p.username?.toLowerCase().includes(kw)
      );
    }

    // Category
    if (categoryFilter !== "All Categories") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Sort
    if (sortOrder === "az") {
      list.sort((a, b) =>
        (a.title || a.website || "").localeCompare(b.title || b.website || "")
      );
    } else if (sortOrder === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // latest (default)
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [passwords, searchQuery, categoryFilter, sortOrder]);

  const isFiltered =
    searchQuery.trim() !== "" || categoryFilter !== "All Categories";

  /* ─── Modal helpers ──────────────────────────────── */
  const openAdd = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleSaveSuccess = () => {
    fetchPasswords();
    closeModal();
  };

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Header />

        {/* Page heading */}
        <div className="vault-page-header">
          <div className="vault-page-header__left">
            <h1>
              <FiLock
                size={22}
                style={{ verticalAlign: "middle", marginRight: 10, color: "#8B5CF6" }}
              />
              My Vault
            </h1>
            <p>All your passwords, encrypted and organised.</p>
          </div>

          {!loading && (
            <span className="vault-count-badge">
              <FiLock size={13} />
              {passwords.length} {passwords.length === 1 ? "password" : "passwords"}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <VaultToolbar
          onAddPassword={openAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {/* Results info when filtering */}
        {!loading && isFiltered && (
          <p className="vault-results-info">
            {filteredPasswords.length === 0
              ? "No results found."
              : `${filteredPasswords.length} result${filteredPasswords.length !== 1 ? "s" : ""} found.`}
          </p>
        )}

        {/* Main content area */}
        {loading ? (
          <div className="vault-loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPasswords.length === 0 ? (
          <VaultEmptyState onAddPassword={openAdd} />
        ) : (
          <div className="vault-cards-grid">
            {filteredPasswords.map((item) => (
              <VaultCard
                key={item._id}
                item={item}
                onActionSuccess={fetchPasswords}
                onToast={showToast}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <AddPasswordModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSaveSuccess={handleSaveSuccess}
        editItem={editItem}
        onToast={showToast}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}

export default Vault;
