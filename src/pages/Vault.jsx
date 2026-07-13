import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiLock, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Vault() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiLock className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">My Vault</h1>
            <p className="placeholder-subtitle">
              Your premium, military-grade encrypted password vault storage is coming soon.
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

export default Vault;
