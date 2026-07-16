import "./Header.css";
import { FiBell, FiSearch, FiUser } from "react-icons/fi";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useEffect, useState } from "react";

function Header() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Vault",
      text: "Your security dashboard is online and active.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "Security Scan",
      text: "No breached emails found in public leaks.",
      time: "2 hrs ago",
      unread: true,
    },
    {
      id: 3,
      title: "Best Practice",
      text: "We recommend using at least 14 characters.",
      time: "1 day ago",
      unread: false,
    },
  ]);

  const hasUnread = notifications.some((n) => n.unread);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="header">
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search passwords..." />
      </div>

      <div className="header-right">
        <span className="current-time">{currentTime}</span>
        <ThemeToggle />
        <div className="notification-wrapper">
          <button
            className={`notification-btn ${showNotifications ? "active" : ""}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <FiBell />
            {hasUnread && <span className="notification-badge" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {hasUnread && (
                  <button className="mark-read-link" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.unread ? "unread" : ""}`}>
                    <div className="item-title-row">
                      <h4>{n.title}</h4>
                      <span className="item-time">{n.time}</span>
                    </div>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            <FiUser />
          </div>
          <div className="user-info">
            <h4>{user?.name || "Guest"}</h4>
            <span>{user?.email || "Not Logged In"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;