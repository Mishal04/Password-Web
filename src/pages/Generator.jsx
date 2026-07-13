import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiKey, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Generator() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiKey className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">Generator</h1>
            <p className="placeholder-subtitle">
              Generate strong, customizable passwords using cryptographically secure parameters.
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

export default Generator;
