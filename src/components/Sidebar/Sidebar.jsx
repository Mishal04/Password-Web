import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiLock, FiFileText, FiKey, FiActivity, FiLogOut } from "react-icons/fi";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
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

      <button className="logout-btn" onClick={handleLogout}>
        <FiLogOut />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;