import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiSettings, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Settings() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiSettings className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">Settings</h1>
            <p className="placeholder-subtitle">
              Manage your preferences, exports, default generation rules, and master configurations.
            </p>
            <div className="placeholder-badge">
              <FiCpu size={14} />
              <span>Under Construction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
