import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiShield, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Security() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiShield className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">Security Center</h1>
            <p className="placeholder-subtitle">
              Audit your vault for weak, reused, or compromised passwords to secure your footprint.
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

export default Security;
