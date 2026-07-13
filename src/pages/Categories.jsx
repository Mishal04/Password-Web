import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { FiFolder, FiCpu } from "react-icons/fi";
import "./Placeholder.css";

function Categories() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon-wrap">
              <FiFolder className="placeholder-icon animate-float" />
            </div>
            <h1 className="placeholder-title">Categories</h1>
            <p className="placeholder-subtitle">
              Organize your passwords into customizable groups, folders, and accounts.
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

export default Categories;
