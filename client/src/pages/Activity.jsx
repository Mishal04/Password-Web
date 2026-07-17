import { useState, useEffect, useCallback } from "react";
import {
  FiActivity,
  FiLock,
  FiFileText,
  FiZap,
  FiUser,
  FiTrash2,
  FiRefreshCw,
  FiFilter,
  FiClock,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar/Sidebar";
import Header  from "../components/Header/Header";
import Toast   from "../components/Toast/Toast";
import API     from "../services/api";

import "./Activity.css";
import "./Dashboard.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Vault", "Notes", "Generator", "Account"];

// Maps action key → icon component + colour token used by the timeline dot
const ACTION_META = {
  "vault.add":          { icon: FiLock,          color: "purple", label: "Password Added"       },
  "vault.update":       { icon: FiLock,          color: "blue",   label: "Password Updated"     },
  "vault.delete":       { icon: FiLock,          color: "red",    label: "Password Deleted"     },
  "vault.favorite":     { icon: FiLock,          color: "yellow", label: "Favourite Toggled"    },
  "note.add":           { icon: FiFileText,      color: "green",  label: "Note Created"         },
  "note.update":        { icon: FiFileText,      color: "blue",   label: "Note Updated"         },
  "note.delete":        { icon: FiFileText,      color: "red",    label: "Note Deleted"         },
  "note.pin":           { icon: FiFileText,      color: "yellow", label: "Note Pinned"          },
  "auth.login":         { icon: FiUser,          color: "green",  label: "Signed In"            },
  "auth.login_failed":  { icon: FiAlertTriangle, color: "red",    label: "Failed Login Attempt" },
  "auth.register":      { icon: FiUser,          color: "purple", label: "Account Created"      },
  "generator.generate": { icon: FiZap,           color: "purple", label: "Password Generated"   },
};

const STATUS_ICON = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  info:    FiInfo,
};

const CATEGORY_ICONS = {
  Vault:     FiLock,
  Notes:     FiFileText,
  Generator: FiZap,
  Account:   FiUser,
};

// Stat-card gradient per category
const CATEGORY_GRADIENTS = {
  Vault:     "linear-gradient(135deg,#FF4FA3,#B388FF)",
  Notes:     "linear-gradient(135deg,#34D399,#059669)",
  Generator: "linear-gradient(135deg,#FBBF24,#F59E0B)",
  Account:   "linear-gradient(135deg,#60A5FA,#3B82F6)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a human-friendly relative time string. */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s  = Math.floor(diff / 1000);
  const m  = Math.floor(s  / 60);
  const h  = Math.floor(m  / 60);
  const d  = Math.floor(h  / 24);
  if (s  < 60)  return "Just now";
  if (m  < 60)  return `${m}m ago`;
  if (h  < 24)  return `${h}h ago`;
  if (d  < 7)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Full timestamp for the tooltip / aria-label. */
function fullTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Group logs by calendar day label. */
function groupByDay(logs) {
  const groups = [];
  let currentDay = null;
  let currentGroup = null;

  logs.forEach((log) => {
    const d    = new Date(log.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dayLabel;
    if (d.toDateString() === today.toDateString())     dayLabel = "Today";
    else if (d.toDateString() === yesterday.toDateString()) dayLabel = "Yesterday";
    else dayLabel = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    if (dayLabel !== currentDay) {
      currentDay   = dayLabel;
      currentGroup = { day: dayLabel, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(log);
  });

  return groups;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ category, count, total }) {
  const Icon     = CATEGORY_ICONS[category] || FiActivity;
  const gradient = CATEGORY_GRADIENTS[category] || "linear-gradient(135deg,#8B5CF6,#6D28D9)";
  const pct      = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="act-stat-card">
      <div className="act-stat-card__icon" style={{ background: gradient }}>
        <Icon size={18} />
      </div>
      <div className="act-stat-card__body">
        <span className="act-stat-card__label">{category}</span>
        <span className="act-stat-card__value">{count}</span>
      </div>
      <div className="act-stat-card__bar-wrap">
        <div
          className="act-stat-card__bar-fill"
          style={{ width: `${pct}%`, background: gradient }}
        />
      </div>
      <span className="act-stat-card__pct">{pct}%</span>
    </div>
  );
}

function TimelineItem({ log }) {
  const meta       = ACTION_META[log.action] || { icon: FiActivity, color: "purple" };
  const Icon       = meta.icon;
  const StatusIcon = STATUS_ICON[log.status] || FiInfo;

  return (
    <div className={`act-timeline-item act-timeline-item--${log.status}`}>
      {/* Left: coloured dot + connector line */}
      <div className="act-timeline-item__track">
        <div className={`act-timeline-item__dot act-dot--${meta.color}`}>
          <Icon size={13} />
        </div>
        <div className="act-timeline-item__line" />
      </div>

      {/* Right: content */}
      <div className="act-timeline-item__content">
        <div className="act-timeline-item__top">
          <div className="act-timeline-item__title-row">
            <span className="act-timeline-item__label">{log.label}</span>
            <span className={`act-timeline-item__status-badge act-badge--${log.status}`}>
              <StatusIcon size={11} />
              {log.status}
            </span>
          </div>
          {log.detail && (
            <span className="act-timeline-item__detail">{log.detail}</span>
          )}
        </div>

        <div className="act-timeline-item__meta">
          <span className="act-timeline-item__category">
            {log.category}
          </span>
          <time
            className="act-timeline-item__time"
            dateTime={log.createdAt}
            title={fullTime(log.createdAt)}
          >
            <FiClock size={11} />
            {relativeTime(log.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ activeFilter, onReset }) {
  return (
    <div className="act-empty">
      <div className="act-empty__illustration">
        <div className="act-empty__circle act-empty__circle--outer" />
        <div className="act-empty__circle act-empty__circle--inner" />
        <div className="act-empty__icon-wrap">
          <FiActivity size={28} />
        </div>
      </div>
      <h3 className="act-empty__title">
        {activeFilter === "All" ? "No activity yet" : `No ${activeFilter} activity`}
      </h3>
      <p className="act-empty__sub">
        {activeFilter === "All"
          ? "Actions like adding passwords, creating notes, and logging in will appear here."
          : `No ${activeFilter.toLowerCase()} events recorded yet.`}
      </p>
      {activeFilter !== "All" && (
        <button type="button" className="act-empty__btn" onClick={onReset}>
          Show all activity
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Activity() {
  const [logs,         setLogs]         = useState([]);
  const [stats,        setStats]        = useState({ Vault: 0, Notes: 0, Generator: 0, Account: 0 });
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [toast,        setToast]        = useState({ message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async (filter, pageNum) => {
    setLoading(true);
    try {
      const params = { limit: 50, page: pageNum };
      if (filter !== "All") params.category = filter;

      const res = await API.get("/activity", { params });

      if (res.data?.success) {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setStats(res.data.stats);
      }
    } catch {
      showToast("Failed to load activity.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLogs(activeFilter, page);
  }, [fetchLogs, activeFilter, page]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterChange = (cat) => {
    setActiveFilter(cat);
    setPage(1);
  };

  const handleRefresh = () => fetchLogs(activeFilter, page);

  const handleClearAll = async () => {
    if (!window.confirm("Clear your entire activity log? This cannot be undone.")) return;
    try {
      await API.delete("/activity");
      setLogs([]);
      setTotal(0);
      setStats({ Vault: 0, Notes: 0, Generator: 0, Account: 0 });
      showToast("Activity log cleared.");
    } catch {
      showToast("Failed to clear log.", "error");
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const grouped    = groupByDay(logs);
  const totalAll   = Object.values(stats).reduce((a, b) => a + b, 0);

  // ── Skeleton ──────────────────────────────────────────────────────────────

  const Skeleton = () => (
    <div className="act-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="act-skeleton__item">
          <div className="act-skeleton__dot" />
          <div className="act-skeleton__lines">
            <div className="act-skeleton__line act-skeleton__line--title" />
            <div className="act-skeleton__line act-skeleton__line--sub" />
          </div>
        </div>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Header />

        {/* Page heading */}
        <div className="act-page-header">
          <div className="act-page-header__left">
            <h1>
              <FiActivity
                size={22}
                style={{ verticalAlign: "middle", marginRight: 10, color: "#8B5CF6" }}
              />
              Activity Log
            </h1>
            <p>Every action you take — recorded, timestamped, and organised.</p>
          </div>

          <div className="act-page-header__actions">
            <button
              type="button"
              className="act-btn act-btn--ghost"
              onClick={handleRefresh}
              aria-label="Refresh activity log"
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
            {total > 0 && (
              <button
                type="button"
                className="act-btn act-btn--danger"
                onClick={handleClearAll}
                aria-label="Clear all activity"
              >
                <FiTrash2 size={14} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="act-stats-grid">
          {Object.entries(stats).map(([cat, count]) => (
            <StatCard
              key={cat}
              category={cat}
              count={count}
              total={totalAll}
            />
          ))}
        </div>

        {/* Filter bar */}
        <div className="act-filter-bar">
          <div className="act-filter-bar__left">
            <FiFilter size={14} className="act-filter-bar__icon" />
            <span className="act-filter-bar__label">Filter</span>
            <div className="act-filter-bar__tabs" role="tablist">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`act-filter-tab ${activeFilter === cat ? "act-filter-tab--active" : ""}`}
                  onClick={() => handleFilterChange(cat)}
                >
                  {cat}
                  {cat !== "All" && stats[cat] > 0 && (
                    <span className="act-filter-tab__count">{stats[cat]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {total > 0 && (
            <span className="act-filter-bar__total">
              <FiShield size={12} />
              {total} event{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Skeleton />
        ) : logs.length === 0 ? (
          <EmptyState
            activeFilter={activeFilter}
            onReset={() => handleFilterChange("All")}
          />
        ) : (
          <>
            <div className="act-timeline">
              {grouped.map((group) => (
                <div key={group.day} className="act-timeline__group">
                  <div className="act-timeline__day-label">
                    <span>{group.day}</span>
                  </div>
                  {group.items.map((log) => (
                    <TimelineItem key={log._id} log={log} />
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="act-pagination">
                <button
                  type="button"
                  className="act-btn act-btn--ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span className="act-pagination__info">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="act-btn act-btn--ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}

export default Activity;
