import { useState, useEffect } from "react";
import "./Dashboard.css";

import {
  FiLock,
  FiAlertTriangle,
  FiShield,
  FiStar,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import StatCard from "../components/StatCard/StatCard";
import VaultToolbar from "../components/VaultToolbar/VaultToolbar";
import PasswordTable from "../components/PasswordTable/PasswordTable";
import AddPasswordModal from "../components/AddPasswordModal/AddPasswordModal";
import API from "../services/api";

function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    weak: 0,
    strong: 0,
    favorites: 0,
    securityScore: 100,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch passwords list
      const passRes = await API.get("/vault");
      if (passRes.data && passRes.data.success) {
        setPasswords(passRes.data.vaults);
      }

      // Fetch stats
      const statsRes = await API.get("/vault/security-stats");
      if (statsRes.data && statsRes.data.success) {
        setStats({
          total: statsRes.data.total,
          weak: statsRes.data.weak,
          strong: statsRes.data.strong,
          favorites: statsRes.data.favorites,
          securityScore: statsRes.data.securityScore,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter passwords based on search query and category filter
  const filteredPasswords = passwords.filter((item) => {
    const matchesCategory =
      categoryFilter === "All Categories" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.website && item.website.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header */}
        <Header />

        {/* Welcome Card */}
        <Hero
          securityScore={stats.securityScore}
          onAddPasswordClick={() => setIsAddModalOpen(true)}
        />

        {/* Statistics */}
        <div className="stats-grid">
          <StatCard
            title="Total Passwords"
            value={stats.total.toString()}
            icon={<FiLock />}
            color="linear-gradient(135deg,#ff71b7,#c7b6ff)"
          />

          <StatCard
            title="Weak Passwords"
            value={stats.weak.toString()}
            icon={<FiAlertTriangle />}
            color="#ff8c42"
          />

          <StatCard
            title="Strong Passwords"
            value={stats.strong.toString()}
            icon={<FiShield />}
            color="#3BC97A"
          />

          <StatCard
            title="Favorites"
            value={stats.favorites.toString()}
            icon={<FiStar />}
            color="#FFC107"
          />
        </div>

        {/* Toolbar */}
        <VaultToolbar
          onAddPassword={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        {/* Password Table */}
        <PasswordTable
          passwords={filteredPasswords}
          onActionSuccess={fetchDashboardData}
        />
      </div>

      {/* Temporary Add Password Modal */}
      <AddPasswordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveSuccess={fetchDashboardData}
      />
    </div>
  );
}

export default Dashboard;