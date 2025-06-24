import React, { useState, useEffect, useRef } from "react";
import Header from "../adminDashBoardComponents/layout/Header";
import Sidebar from "../adminDashBoardComponents/layout/Sidebar";
import Dashboard from "../adminDashBoardComponents/dashboard/Dashboard";
import Complaints from "../adminDashBoardComponents/complaints/Complaints";
import EngineersList from "../adminDashBoardComponents/engineers/EngineersList";
import AddEngineerForm from "../adminDashBoardComponents/engineers/AddEngineerForm";
import ComplaintDetailsModal from "../adminDashBoardComponents/modals/ComplaintDetailsModal";
import AssignComplaintModal from "../adminDashBoardComponents/modals/AssignComplaintModal";
import NotificationsPanel from "../adminDashBoardComponents/common/NotificationsPanel";
import ProfileDropdown from "../adminDashBoardComponents/common/ProfileDropdown";
import SuccessToast from "../adminDashBoardComponents/common/SuccessToast";
import ViewEngineerModal from "../adminDashBoardComponents/engineers/ViewEngineerModal";
import "../styles/AdminDashboard.css";
import "../styles/AdminDashboardComplaints.css";
import "../styles/SuccessToast.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const API_BASE = "https://hostel-maintenance-system-backend.onrender.com/api";

const AdminDashboard = () => {
  const [adminProfile] = useState({
    name: "Admin User",
    email: "admin@iiita.ac.inefeff",
    phone: "+91 9876543210",
  });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [notificationPanelVisible, setNotificationPanelVisible] =
    useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const profileDropdownRef = useRef(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [successMessage, setSuccessMessage] = useState({
    visible: false,
    message: "",
  });

  const [complaintDetailsModal, setComplaintDetailsModal] = useState({
    visible: false,
    complaint: null,
  });
  const [assignEngineerModal, setAssignEngineerModal] = useState({
    visible: false,
    complaintId: null,
  });

  const fetchComplaints = async () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const adminId = decoded.user_PK; // 👈 admin's user ID

    try {
      const url =
        activeSection === "Complaints"
          ? `${API_BASE}/admin/complaints/with-assignees/${adminId}`
          : `${API_BASE}/admin/complaints`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fetch error (${res.status}): ${text}`);
      }
      const data = await res.json();

      setComplaints(data);
    } catch (err) {
      console.error("Complaints fetch failed:", err);
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await axios.get("https://hostel-maintenance-system-backend.onrender.com/api/admin/engineers", {
        withCredentials: true,
      });
      setEngineers(res.data);
    } catch (err) {
      console.error("Failed to fetch engineers:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchEngineers();
    fetch(`${API_BASE}/admin/engineers`)
      .then((res) => res.json())
      .then(setEngineers)
      .catch((err) => {
        console.error(err);
        setEngineers([]);
      });
  }, [activeSection]);

  const handleAddEngineer = async (engineerData) => {
    try {
      const res = await fetch(`${API_BASE}/admin/engineer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(engineerData),
      });

      if (!res.ok) throw new Error("Add engineer failed");

      const saved = await res.json();

      const newEngineer = {
        id: saved.engineerId || Math.random(),
        name: saved.name || engineerData.name || "Unnamed",
        email: saved.mail_UN || engineerData.mail_UN || "noemail@domain.com",
        specialization: saved.specialization || "General",
        phone: saved.phone_number || engineerData.phone_number || "N/A",
        status: saved.availability || "Available",
        assignedComplaints: 0,
        completedComplaints: 0,
      };

      setEngineers((prev) => [...prev, newEngineer]);
      setActiveSection("engineers");

      setSuccessMessage({
        visible: true,
        message: "Engineer added successfully!",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignEngineerSubmit = async ({
    complaintId,
    engineerId,
    note,
  }) => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const adminId = decoded.user_PK; // 👈 admin's user ID
    try {
      const res = await fetch(`${API_BASE}/admin/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, engineerId, note, adminId }),
      });

      if (!res.ok) throw new Error("Assignment failed");

      const updated = await res.json();

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: "In Progress" }
            : complaint
        )
      );

      setSuccessMessage({
        visible: true,
        message: "Engineer assigned successfully!",
      });

      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );

      setAssignEngineerModal({ visible: false, complaintId: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const [engineerDetailsModal, setEngineerDetailsModal] = useState({
    visible: false,
    engineer: null,
  });

  const handleViewEngineerDetails = async (engineerId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/engineers/${engineerId}`);
      if (!res.ok) throw new Error("Failed to fetch engineer");
      const data = await res.json();
      setEngineerDetailsModal({ visible: true, engineer: data });
    } catch (e) {
      alert(e.message);
    }
  };
  const handleDeleteEngineer = async (user_FK) => {
    if (!window.confirm("Are you sure you want to deactivate this engineer?"))
      return false;

    try {
      await axios.patch(
        `https://hostel-maintenance-system-backend.onrender.com/api/admin/engineers/${user_FK}/deactivate`
      );

      // Immediately fetch the updated list
      await fetchEngineers();

      // We don't need to manually filter since we're refreshing the data
      return true; // Return true to indicate success
    } catch (err) {
      console.error("Failed to deactivate engineer:", err);
      alert("Error while deactivating engineer");
      return false; // Return false to indicate failure
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownVisible((v) => !v);
    if (notificationPanelVisible) setNotificationPanelVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setProfileDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewComplaintDetails = async (c) => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/complaints/with-assignees/${c.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch complaint details");
      const detailedComplaint = await res.json();
      setComplaintDetailsModal({ visible: true, complaint: detailedComplaint });
    } catch (err) {
      console.error("Error fetching detailed complaint:", err);
      alert("Could not load complaint details");
    }
  };
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
    <div className="admin-dashboard-wrapper">
      <Header
        adminProfile={adminProfile}
        notifications={notifications}
        notificationPanelVisible={notificationPanelVisible}
        setNotificationPanelVisible={setNotificationPanelVisible}
        profileDropdownVisible={profileDropdownVisible}
        toggleProfileDropdown={toggleProfileDropdown}
      />

      <div className="admin-dashboard-container">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="admin-dashboard-main-content">
          {activeSection === "dashboard" && (
            <Dashboard
              complaints={complaints}
              handleViewDetails={handleViewComplaintDetails}
              handleAssignEngineer={(id) =>
                setAssignEngineerModal({ visible: true, complaintId: id })
              }
            />
          )}

          {activeSection === "complaints" && (
            <Complaints
              complaints={complaints}
              handleViewDetails={handleViewComplaintDetails} //  use the API-calling version
              handleAssignEngineer={(id) =>
                setAssignEngineerModal({ visible: true, complaintId: id })
              }
            />
          )}

          {activeSection === "engineers" && (
            <EngineersList
              handleEngineerDetails={handleViewEngineerDetails}
              handleDeleteEngineer={handleDeleteEngineer}
              showToast={showToast}
              refreshEngineers={fetchEngineers}
              engineers={engineers}
            />
          )}
          {engineerDetailsModal.visible && (
            <ViewEngineerModal
              engineer={engineerDetailsModal.engineer}
              onClose={() =>
                setEngineerDetailsModal({ visible: false, engineer: null })
              }
            />
          )}

          {activeSection === "add-engineer" && (
            <AddEngineerForm onSubmit={handleAddEngineer} />
          )}
        </main>

        {notificationPanelVisible && (
          <NotificationsPanel
            notifications={notifications}
            markNotificationAsRead={markNotificationAsRead}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            visible={notificationPanelVisible}
          />
        )}

        {profileDropdownVisible && (
          <div className="admin-dashboard-profile-dropdown-container">
            <ProfileDropdown
              ref={profileDropdownRef}
              adminProfile={adminProfile}
              visible={profileDropdownVisible}
              onLogout={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            />
          </div>
        )}

        {complaintDetailsModal.visible && (
          <div className="admin-dashboard-modal-overlay">
            <ComplaintDetailsModal
              complaint={complaintDetailsModal.complaint}
              onClose={() =>
                setComplaintDetailsModal({ visible: false, complaint: null })
              }
            />
          </div>
        )}

        {assignEngineerModal.visible && (
          <div className="admin-dashboard-modal-overlay">
            <AssignComplaintModal
              complaint={complaints.find(
                (c) => c.id === assignEngineerModal.complaintId
              )}
              engineers={engineers}
              onAssign={handleAssignEngineerSubmit}
              onClose={() =>
                setAssignEngineerModal({ visible: false, complaintId: null })
              }
            />
          </div>
        )}

        <SuccessToast
          message={successMessage.message}
          visible={successMessage.visible}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
