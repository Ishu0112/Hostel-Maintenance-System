import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaUserCircle, FaQuestionCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import NotificationsPanel from "./NotificationsPanel";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [studentName, setStudentName] = useState("");

  // ⬅️ On mount, decode token and fetch student name
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      return;
    }

    const userPk = decodedToken.user_PK; // adjust if your token uses a different key
    if (!userPk) {
      console.error("User PK not found in token");
      return;
    }

    // Fetch student profile using userPk from token
    axios
      .get(`/api/student/profile/${userPk}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudentName(res.data.profile.name);
      })
      .catch((err) => {
        console.error("Could not load student name:", err);
      });
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const user_PK = decodedToken.user_PK;

      const res = await fetch(
        `https://hostel-maintenance-system-backend.onrender.com/api/notifications/${user_PK}`
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const user_PK = decodedToken.user_PK;

      const res = await fetch(
        `https://hostel-maintenance-system-backend.onrender.com/api/notifications/markAllAsRead/${user_PK}`,
        {
          method: "PUT",
        }
      );
      if (!res.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_status: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const markNotificationAsRead = async (notification_PK) => {
    try {
      const res = await fetch(
        `https://hostel-maintenance-system-backend.onrender.com/api/notifications/markAsRead/${notification_PK}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_PK === notification_PK
            ? { ...n, read_status: true }
            : n
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("notificationsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  return (
    <header className="dashboard-header enhanced">
      <div className="logo">
        <h1>Maintenance Portal</h1>
      </div>

      <div className="header-controls">
        {/* <button className="help-btn">
          <FaQuestionCircle />
        </button> */}

        <button
          className="studentdashboard-notification-panel-btn enhanced"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="studentdashboard-notification-panel-badge pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <div
          className="user-profile enhanced"
          onClick={() => setShowProfile(!showProfile)}
        >
          <div className="avatar-container">
            <FaUserCircle className="avatar" />
            <span className="online-indicator"></span>
          </div>
          <span className="user-name">{studentName || "Loading…"}</span>
        </div>

        <NotificationsPanel
          notifications={notifications}
          visible={showNotifications}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
          markNotificationAsRead={markNotificationAsRead}
        />

        {showProfile && (
          <ProfileDropdown onClose={() => setShowProfile(false)} />
        )}
      </div>
    </header>
  );
};

export default Header;
