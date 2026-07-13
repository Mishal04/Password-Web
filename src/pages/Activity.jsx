import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiActivity, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Activity() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiActivity className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">Activity Log</h1>
            <p className="placeholder-subtitle">
              Monitor logins, password accesses, and account changes via a persistent audit log.
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

export default Activity;
