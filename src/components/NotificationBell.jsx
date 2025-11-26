import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "../styles/notifications.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastId, setLastId] = useState(() => {
    // Load lastId from localStorage on mount
    const stored = localStorage.getItem("arcade_notification_lastId");
    return stored ? parseInt(stored, 10) : 0;
  });
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      console.log("[Notifications] Fetching notifications, lastId:", lastId);
      const response = await api.getNotifications(lastId);
      console.log("[Notifications] Response:", response);

      if (response.success && response.data) {
        const newNotifications = response.data;
        console.log(
          "[Notifications] New notifications count:",
          newNotifications.length
        );

        if (newNotifications.length > 0) {
          console.log(
            "[Notifications] Processing notifications:",
            newNotifications
          );
          // Add new notifications to the list
          setNotifications((prev) =>
            [...newNotifications, ...prev].slice(0, 50)
          ); // Keep last 50

          // Update last ID and save to localStorage
          const maxId = Math.max(...newNotifications.map((n) => n.id));
          setLastId(maxId);
          localStorage.setItem("arcade_notification_lastId", maxId.toString());
          console.log("[Notifications] Updated lastId to:", maxId);

          // Show toast for new notifications
          newNotifications.forEach((notification) => {
            console.log("[Notifications] Showing toast for:", notification);
            showToast(notification);
          });
        } else {
          console.log("[Notifications] No new notifications");
        }
      } else {
        console.log("[Notifications] Response not successful or no data");
      }
    } catch (error) {
      console.error("[Notifications] Failed to fetch notifications:", error);
    }
  };

  // Show toast notification
  const showToast = (notification) => {
    const toast = document.createElement("div");
    toast.className = "arcade-notification-toast";
    toast.innerHTML = `
      <div class="arcade-notification-toast-title">${
        notification.title || "Notification"
      }</div>
      <div class="arcade-notification-toast-content">${
        notification.content
      }</div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    pollIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [lastId]);

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    // Update lastId to the highest notification ID to mark all as "seen"
    if (notifications.length > 0) {
      const maxId = Math.max(...notifications.map((n) => n.id));
      setLastId(maxId);
      localStorage.setItem("arcade_notification_lastId", maxId.toString());
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Manual test function
  const testFetch = () => {
    console.log("[Notifications] Manual test fetch triggered");
    fetchNotifications();
  };

  return (
    <div className="arcade-notification-bell" ref={dropdownRef}>
      <button
        className="arcade-nav-button arcade-notification-button"
        onClick={toggleDropdown}
        onDoubleClick={testFetch}
        title="Notifications (double-click to test)"
      >
        🔔
        {unreadCount > 0 && (
          <span className="arcade-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="arcade-notification-dropdown">
          <div className="arcade-notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="arcade-notification-clear"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="arcade-notification-list">
            {notifications.length === 0 ? (
              <div className="arcade-notification-empty">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="arcade-notification-item">
                  <div className="arcade-notification-item-title">
                    {notification.title || "Notification"}
                  </div>
                  <div className="arcade-notification-item-content">
                    {notification.content}
                  </div>
                  <div className="arcade-notification-item-time">
                    {formatTime(notification.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
