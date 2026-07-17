import { useState, useEffect } from "react";
import "./Sidebar.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiLock, FiFileText, FiKey, FiActivity, FiLogOut, FiMenu, FiX } from "react-icons/fi";

function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  // Close drawer on every route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* ── Hamburger button — only visible on mobile ── */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="logo">
          <div className="logo-icon">🔐</div>
          <div>
            <h2>Password</h2>
            <span>Vault</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
            <FiHome />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/vault" className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
            <FiLock />
            <span>My Vault</span>
          </NavLink>
          <NavLink to="/secure-notes" className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
            <FiFileText />
            <span>Secure Notes</span>
          </NavLink>
          <NavLink to="/generator" className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
            <FiKey />
            <span>Password Generator</span>
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
            <FiActivity />
            <span>Activity</span>
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout} type="button">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
