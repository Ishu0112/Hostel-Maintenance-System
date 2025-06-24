// src/EngineerDashboardComponents/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import NotificationsPanel from "./NotificationPanel";
import { FaBell } from "react-icons/fa"; // ✅ ADD THIS LINE
import "../styles/EngineerHeaderFixes.css"; // Import the header fixes CSS

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [engineerProfile, setEngineerProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileAvatarRef = useRef();

  // Fetch engineer on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");


      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }

      const decoded = jwtDecode(token);


      const userPk = decoded?.user_PK;

      if (!userPk) {
        console.warn("User PK not found in token.");
        return;
      }

      axios
        .get(`/api/engineer/profile/${userPk}`)
        .then((res) => {

          setEngineerProfile(res.data.profile);
        })
        .catch((err) => {
          console.error("Could not load engineer profile:", err);
        });
    } catch (err) {
      console.error("Error decoding token or fetching profile:", err);
    }
  }, []);


  const isLoading = !engineerProfile;

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
    <>
      {/* <header className="engineer-dashboard-header">
        <div className="engineer-logo">
          <h1>Maintenance Portal</h1>
        </div>
        {isLoading ? (
        <div>Loading profile…</div>
      ) : (
        <>
        <button
                  className="notification-btn enhanced"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge pulse">{unreadCount}</span>
                  )}
                </button>
        <div
          className="engineer-user-profile"
          onClick={() => setShowProfile((v) => !v)}
        >
          <span>{engineerProfile.name}</span>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              engineerProfile.name
            )}&background=2196f3&color=fff`}
            alt="Profile"
            className="engineer-avatar"
            ref={profileAvatarRef}
          />
        </div>
        </>
          )}
        </header> */}

      <header className="engineer-dashboard-header">
        <div className="engineer-logo">
          <h1>Maintenance Portal</h1>
        </div>
        {isLoading ? (
          <div>Loading profile…</div>
        ) : (
          <>
            <div className="engineer-header-right">
              <button
                className="engineerdashboard-notification-pannel-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="engineerdashboard-notification-pannel-badge pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div
                className="engineer-user-profile"
                onClick={() => setShowProfile((v) => !v)}
              >
                <span>{engineerProfile.name || "engineer"}</span>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    engineerProfile.name
                  )}&background=2196f3&color=fff`}
                  alt="Profile"
                  className="engineer-avatar"
                  ref={profileAvatarRef}
                />
              </div>
            </div>
          </>
        )}
      </header>

      {showProfile && (
        <div className="engineer-profile-dropdown">
          <div className="engineer-profile-header">
            <div className="engineer-profile-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  engineerProfile.name
                )}&background=2196f3&color=fff&size=120`}
                alt={engineerProfile.name}
              />
            </div>
            <div className="engineer-profile-name-info">
              <h3>{engineerProfile.name}</h3>
              <span className="engineer-profile-id">
                {engineerProfile.employeeId}
              </span>
            </div>
          </div>

          <div className="engineer-profile-details">
            <h4 className="engineer-section-title">Engineer Details</h4>

            <div className="engineer-detail-item">
              <span className="engineer-detail-icon">📧</span>
              <div className="engineer-detail-content">
                <span className="engineer-detail-label">Email: </span>
                <span className="engineer-detail-value">
                  {engineerProfile.email}
                </span>
              </div>
            </div>

            <div className="engineer-detail-item">
              <span className="engineer-detail-icon">⚡</span>
              <div className="engineer-detail-content">
                <span className="engineer-detail-label">Specialization: </span>
                <span className="engineer-detail-value">
                  {engineerProfile.specialization}
                </span>
              </div>
            </div>

            <div className="engineer-detail-item">
              <span className="engineer-detail-icon">📱</span>
              <div className="engineer-detail-content">
                <span className="engineer-detail-label">Contact: </span>
                <span className="engineer-detail-value">
                  {engineerProfile.contactNumber}
                </span>
              </div>
            </div>

            <div className="engineer-detail-item">
              <span className="engineer-detail-icon">⏳</span>
              <div className="engineer-detail-content">
                <span className="engineer-detail-label">
                  Experience(year/(s)):{" "}
                </span>
                <span className="engineer-detail-value">
                  {engineerProfile.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="engineer-profile-accommodation">
            <h4 className="engineer-section-title">Address</h4>
            <div className="engineer-detail-item">
              <span className="engineer-detail-icon">🏢</span>
              <div className="engineer-detail-content">
                {/* <span className="engineer-detail-label">Staff Quarters</span> */}
                <span className="engineer-detail-value">
                  {engineerProfile.address}
                </span>
              </div>
            </div>
          </div>

          <div className="engineer-profile-actions">
            {/* <button className="engineer-profile-action-btn">
              <span className="engineer-btn-icon">⚙️</span> Edit Profile
            </button> */}
            <button
              className="engineer-profile-action-btn engineer-logout"
              onClick={() => {
                localStorage.removeItem("user_PK");

                window.location.href = "/login";
              }}
            >
              <span className="engineer-btn-icon">🚪</span> Logout
            </button>
          </div>
        </div>
      )}
      <NotificationsPanel
        notifications={notifications}
        visible={showNotifications}
        markAllNotificationsAsRead={markAllNotificationsAsRead}
        markNotificationAsRead={markNotificationAsRead}
        closePanel={() => setShowNotifications(false)}
      />
    </>
  );
};

export default Header;
