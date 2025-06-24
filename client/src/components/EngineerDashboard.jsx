// src/Components/EngineerDashboard.jsx
import { useState, useEffect, useRef } from "react";
import Header from "../EngineerDashboardComponents/Header";
import Sidebar from "../EngineerDashboardComponents/Sidebar";
import DashboardOverview from "../EngineerDashboardComponents/DashboardOverview";
import NewComplaints from "../EngineerDashboardComponents/NewComplaints";
import AssignedComplaints from "../EngineerDashboardComponents/AssignedComplaints";
import ComplaintHistory from "../EngineerDashboardComponents/ComplaintHistory";
import Schedule from "../EngineerDashboardComponents/Schedule";
import UpdateModal from "../EngineerDashboardComponents/UpdateModal";
import DetailsModal from "../EngineerDashboardComponents/DetailsModal";
import NotificationPanel from "../EngineerDashboardComponents/NotificationPanel";
import "../styles/EngineerDashboard.css";
import axios from "axios";
import {jwtDecode} from "jwt-decode";


const EngineerDashboard = () => {
  // State for form and UI management
  const [updateForm, setUpdateForm] = useState({
      status: "",
      description: "",
      scheduled_visit_date: "",
      scheduled_visit_time: "",
      visit_type: "",
      work_done: "",
      parts_replaced: ""
  });
  const [engineerProfile, setEngineerProfile] = useState({});
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileAvatarRef = useRef(null);

  // Data states
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scheduledVisits, setScheduledVisits] = useState([]);

  // UI states
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notificationPanelVisible, setNotificationPanelVisible] =
    useState(false);
  const [updateModal, setUpdateModal] = useState({
    visible: false,
    complaintId: null,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filteredAssignedComplaints, setFilteredAssignedComplaints] = useState([]);
const [filteredCompletedComplaints, setFilteredCompletedComplaints] = useState([]);
const [filteredPendingComplaints, setFilteredPendingComplaints] = useState([]);
  const [successMessage, setSuccessMessage] = useState({
    visible: false,
    message: "",
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the user ID from local storage or session
  
   
      const token = localStorage.getItem("token");

    
      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }
    
      const decoded = jwtDecode(token);

    
      const engineerId  = decoded?.user_PK;

  // // Fetch engineer profile data
  useEffect(() => {
    const fetchEngineerProfile = async () => {
      try {
        const response = await axios.get(`/api/engineer/profile/${engineerId}`);
        setEngineerProfile(response.data.profile);
      } catch (err) {
        console.error("Error fetching engineer profile:", err);
        setError("Failed to load profile data");
      }
    };

    if (engineerId) {
      fetchEngineerProfile();
    }
  }, [engineerId]);


//Fetch Pending complaints
const fetchPendingComplaints = async () => {
  try {
    const response = await axios.get(`/api/engineer/complaints/pending/${engineerId}`);
    setPendingComplaints(response.data.pendingAssignments);
  } catch (err) {
    console.error("Error fetching pending complaints:", err);
  }
};
// Fetch assigned complaints
const fetchAssignedComplaints = async () => {
  try {
    const response = await axios.get(`/api/engineer/complaints/assigned/${engineerId}`);
    setAssignedComplaints(response.data);
  } catch (err) {
    console.error("Error fetching assigned complaints:", err);
  }
};
// Fetch completed complaints
const fetchCompletedComplaints = async () => {
  try {
    const response = await axios.get(`/api/engineer/complaints/completed/${engineerId}`);
    setCompletedComplaints(response.data);
  } catch (err) {
    console.error("Error fetching completed complaints:", err);
  }
};
// Fetch notifications
const fetchNotifications = async () => {
  try {
    const response = await axios.get(`/api/notifications/${engineerId}`);
    setNotifications(response.data);
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};
// Fetch scheduled visits
const fetchScheduledVisits = async () => {
  try {
    const response = await axios.get(
      `/api/engineer/scheduled-visits/${engineerId}`
    );
    setScheduledVisits(response.data);
  } catch (err) {
    console.error("Error fetching scheduled visits:", err);
  }
};
// Function to refresh all dashboard data
const refreshDashboardData = async () => {
  try {
    setLoading(true); //  Start loading
    await Promise.all([
      fetchPendingComplaints(),
      fetchAssignedComplaints(),
      fetchCompletedComplaints(),
      fetchScheduledVisits(),
      fetchNotifications(),
    ]);
    setLoading(false); //  Stop loading once done
  } catch (error) {
    console.error("Error refreshing dashboard data:", error);
    setError("Failed to load dashboard data");
    setLoading(false); // Ensure loading is stopped on error too
  }
};

// Initial data fetch
useEffect(() => {

  if (engineerId) {
    refreshDashboardData();
  }
}, [engineerId]);

  // Filter assigned complaints based on status and search query
  useEffect(() => {
  let result = [...assignedComplaints];
  if (statusFilter !== "all") {
    result = result.filter(
      (complaint) =>
        complaint.status.toLowerCase().replace(" ", "-") === statusFilter
    );
  }
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.location.toLowerCase().includes(query) ||
        complaint.category.toLowerCase().includes(query) ||
        complaint.studentName?.toLowerCase().includes(query)
    );
  }
  setFilteredAssignedComplaints(result);
}, [statusFilter, searchQuery, assignedComplaints]);

  
useEffect(() => {
  
  let result = Array.isArray(pendingComplaints) ? [...pendingComplaints] : [];

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    result = result.filter((complaint) =>
      (complaint.title || "").toLowerCase().includes(query) ||
      (complaint.description || "").toLowerCase().includes(query) ||
      (complaint.location || "").toLowerCase().includes(query) ||
      (complaint.category || "").toLowerCase().includes(query) ||
      (complaint.studentName || "").toLowerCase().includes(query)
    );
  }


  setFilteredPendingComplaints(result);
}, [searchQuery, pendingComplaints]);

useEffect(() => {

}, [filteredPendingComplaints]);




//filter completed complaints based on search query
useEffect(() => {
  let result = [...completedComplaints];
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.location.toLowerCase().includes(query) ||
        complaint.category.toLowerCase().includes(query) ||
        complaint.studentName?.toLowerCase().includes(query)
    );
  }
  setFilteredCompletedComplaints(result);
}, [searchQuery, completedComplaints]);



  // Handle click outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownVisible &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileAvatarRef.current &&
        !profileAvatarRef.current.contains(event.target)
      ) {
        setProfileDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownVisible]);

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (complaint) => {
    complaint.preventDefault();
    const complaintId = updateModal.complaintId;
     // 🔍 Find the full complaint object to extract admin_FK
  const matchedComplaint = assignedComplaints.find(
    (c) => c.id === complaintId
  );

  if (!matchedComplaint) {
    console.error("Complaint not found in assignedComplaints");
    return;
  }
    try {
      // Send update to server
      await axios.put(`https://hostel-maintenance-system-backend.onrender.com/api/engineer/complaints/update/${engineerId}`, {
        complaintId,
        status: updateForm.status,
        work_done: updateForm.work_done,
        parts_replaced: updateForm.parts_replaced,
    description: updateForm.description,
    scheduled_visit_date: updateForm.scheduled_visit_date,
    scheduled_visit_time: updateForm.scheduled_visit_time,
    visit_type: updateForm.visit_type,
   // ✅ Now you can safely send it
      adminUserId: matchedComplaint.admin_FK,
      });
      await refreshDashboardData();


      // Update UI based on response
      // If status is completed, move to completed complaints
      if (updateForm.status === "Completed") {
        const completedComplaint = assignedComplaints.find(
          (c) => c.id === complaintId
        );
        if (completedComplaint) {
          // Add to completed complaints
          const updatedComplaint = {
            ...completedComplaint,
            status: "Completed",
            completedDate: new Date().toISOString().split("T")[0],
          };
          setCompletedComplaints((prev) => [updatedComplaint, ...prev]);
          // Remove from assigned complaints
          setAssignedComplaints((prev) =>
            prev.filter((c) => c.id !== complaintId)
          );
        }
      } else {
        // Just update the complaint in the assigned list
        setAssignedComplaints((prev) =>
          prev.map((complaint) => {
            if (complaint.id === complaintId) {
              return {
                ...complaint,
                status: updateForm.status || complaint.status,
                lastUpdated: new Date().toISOString().split("T")[0],
                scheduledVisit: updateForm.nextVisitDate
                  ? `${updateForm.nextVisitDate} (Time TBD)`
                  : complaint.scheduledVisit,
              };
            }
            return complaint;
          })
        );
      }

      // If there's a next visit date, add to scheduled visits
      if (updateForm.nextVisitDate) {
        const complaintDetails = assignedComplaints.find(
          (c) => c.id === complaintId
        );
        if (complaintDetails) {
          const newScheduledVisit = {
            id: complaintId,
            title: complaintDetails.title,
            location: complaintDetails.location,
            date: updateForm.nextVisitDate,
            time: "TBD",
          };
          setScheduledVisits((prev) => [...prev, newScheduledVisit]);
        }
      }

      // Reset form and show success message
      setUpdateForm({
          status: "",
  description: "",
  scheduled_visit_date: "",
  scheduled_visit_time: "",
  visit_type: "",
  work_done: "",
  parts_replaced: ""
      });
      setUpdateModal({ visible: false, complaintId: null });
      setSuccessMessage({
        visible: true,
        message: "Complaint updated successfully!",
      });

      // Refresh data
      const response = await axios.get(
        `/api/notifications/${engineerId}`
      );
      setNotifications(response.data);

      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    } catch (err) {
      console.error("Error updating complaint:", err);
      setSuccessMessage({
        visible: true,
        message: "Error updating complaint. Please try again.",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    }
  };

  const handleViewDetails = (complaint) => {


    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handleOpenUpdateModal = (complaintId) => {
    setUpdateModal({ visible: true, complaintId });
  };

 
 

  const toggleProfileDropdown = () => {
    setProfileDropdownVisible(!profileDropdownVisible);
    if (notificationPanelVisible) {
      setNotificationPanelVisible(false);
    }
  };

 


  const getCategoryIcon = (category) => {
    switch (category) {
      case "plumbing":
        return "🚿";
      case "electrical":
        return "💡";
      case "furniture":
        return "🪑";
      case "hvac":
        return "❄️";
      case "electronics":
        return "🖥️";
      default:
        return "📅";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const handleAcceptComplaint = async (complaint) => {

    try {
      await axios.put("https://hostel-maintenance-system-backend.onrender.com/api/engineer/complaints/accept", {
        complaintId: complaint.id,
        engineerId,
        adminUserId: complaint.admin_FK,
      });
      await refreshDashboardData();


      // Update UI
      const acceptedComplaint = {
        ...complaint,
        status: "Pending",
        assignedDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
        comments: [],
        visitHistory: [],
      };

      setAssignedComplaints((prev) => [...prev, acceptedComplaint]);
      setPendingComplaints((prev) => prev.filter((c) => c.id !== complaint.id));

      // Refresh notifications
      const response = await axios.get(
        `/api/notifications/${engineerId}`
      );
      setNotifications(response.data);

      setSuccessMessage({
        visible: true,
        message: "Complaint accepted successfully!",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    } catch (err) {
      console.error("Error accepting complaint:", err);
      setSuccessMessage({
        visible: true,
        message: "Error accepting complaint. Please try again.",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    }
  };

  const handleRejectComplaint = async (complaint) => {

    try {
      await axios.put("https://hostel-maintenance-system-backend.onrender.com/api/engineer/complaints/reject", {
        complaintId: complaint.id,
        engineerId,
        adminUserId: complaint.admin_FK,
      });
      await refreshDashboardData();


      // Update UI
      setPendingComplaints((prev) => prev.filter((c) => c.id !== complaint.id));

      // Refresh notifications
      const response = await axios.get(
        `/api/notifications/${engineerId}`
      );
      setNotifications(response.data);

      setSuccessMessage({
        visible: true,
        message: "Complaint rejected successfully!",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    } catch (err) {
      console.error("Error rejecting complaint:", err);
      setSuccessMessage({
        visible: true,
        message: "Error rejecting complaint. Please try again.",
      });
      setTimeout(
        () => setSuccessMessage({ visible: false, message: "" }),
        3000
      );
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
  };

  return (
    <div className="engineer-dashboard">
      {successMessage.visible && (
        <div className="engineer-success-toast">
          <div className="engineer-success-toast-content">
            <span className="engineer-success-icon">✓</span>
            <p>{successMessage.message}</p>
          </div>
        </div>
      )}
      <Header/>
    

      <div className="engineer-dashboard-container">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          pendingComplaints={pendingComplaints}
        />

        <main className="engineer-main-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <>
              {activeSection === "dashboard" && (
                <DashboardOverview
                  pendingComplaints={pendingComplaints}
                  assignedComplaints={assignedComplaints}
                  completedComplaints={completedComplaints}
                  scheduledVisits={scheduledVisits}
                  handleViewDetails={handleViewDetails}
                  handleOpenUpdateModal={handleOpenUpdateModal}
                />
              )}

              {activeSection === "new-complaints" && (

                <NewComplaints
                  // pendingComplaints={pendingComplaints}
                  pendingComplaints={filteredPendingComplaints}
                  getPriorityIcon={getPriorityIcon}
                  getCategoryIcon={getCategoryIcon}
                  handleViewDetails={handleViewDetails}
                  handleRejectComplaint={handleRejectComplaint}
                  handleAcceptComplaint={handleAcceptComplaint}
                />
              )}

              
{activeSection === "assigned" && (
  <AssignedComplaints
    complaints={filteredAssignedComplaints}
    setStatusFilter={setStatusFilter}
    statusFilter={statusFilter}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    getPriorityIcon={getPriorityIcon}
    getCategoryIcon={getCategoryIcon}
    handleViewDetails={handleViewDetails}
    handleOpenUpdateModal={handleOpenUpdateModal}
  />
)}

{activeSection === "history" && (
  <ComplaintHistory
    completedComplaints={filteredCompletedComplaints}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    getCategoryIcon={getCategoryIcon}
    handleViewDetails={handleViewDetails}
  />
)}



              {activeSection === "schedule" && (
                <Schedule
                  scheduledVisits={scheduledVisits}
                  assignedComplaints={assignedComplaints}
                  getCategoryIcon={getCategoryIcon}
                  handleViewDetails={handleViewDetails}
                />
              )}
            </>
          )}
        </main>

        {notificationPanelVisible && (
          <NotificationPanel
            notifications={notifications}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            markNotificationAsRead={markNotificationAsRead}
          />
        )}

        {updateModal.visible && (
          <UpdateModal
            updateModal={updateModal}
            updateForm={updateForm}
            handleUpdateFormChange={handleUpdateFormChange}
            handleUpdateSubmit={handleUpdateSubmit}
            assignedComplaints={assignedComplaints}
            getCategoryIcon={getCategoryIcon}
            setUpdateModal={setUpdateModal}
          />
        )}

        {showDetailsModal && selectedComplaint && (
          <DetailsModal
            selectedComplaint={selectedComplaint}
            closeDetailsModal={closeDetailsModal}
          />
        )}
      </div>
    </div>
  );
};

export default EngineerDashboard;
