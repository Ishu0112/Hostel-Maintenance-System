import React, { useState, useEffect } from "react";
import Header from "../studentDashBoardComponents/common/Header";
import Sidebar from "../studentDashBoardComponents/common/Sidebar";
import StatsCards from "../studentDashBoardComponents/dashboard/StatsCards";
import RecentComplaints from "../studentDashBoardComponents/dashboard/RecentComplaints";
import ComplaintForm from "../studentDashBoardComponents/complaints/ComplaintForm";
import ComplaintHistory from "../studentDashBoardComponents/complaints/ComplaintHistory";
import FeedbackModal from "../studentDashBoardComponents/modals/FeedbackModal";
import DeleteConfirmationModal from "../studentDashBoardComponents/modals/DeleteConfirmationModal";
import ComplaintDetailsModal from "../studentDashBoardComponents/modals/ComplaintDetailsModal";
import SuccessToast,{SuccessToastComponent} from "../studentDashBoardComponents/common/SuccessToast";
import "../styles/StudentDashboard.css";
import axios from 'axios';




const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
     
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackSubmit = async ({ complaintId, rating, feedback }) => {
  try {
    await axios.post('/api/feedback', {
      complaintId,
      rating,
      text: feedback,
    });
    setComplaints(cs =>
      cs.map(c =>
        c.id === complaintId
          ? { ...c, rating: rating, feedback: feedback }
          : c
      )
    );
    setShowFeedbackModal(false);
    SuccessToast.show("Feedback Submitted", "Thank you!");
  } catch (err) {
    console.error(err);
    SuccessToast.show("Error", "Unable to submit feedback.");
  }
};






 

  const updateStats = (updatedComplaints) => {
    setStats({
      total: updatedComplaints.length,
      pending: updatedComplaints.filter((c) => c.status === "pending").length,
      inProgress: updatedComplaints.filter((c) => c.status === "in-progress")
        .length,
      resolved: updatedComplaints.filter((c) => c.status === "completed")
        .length,
    });
  };

  // const showToast = (title, message) => {
  //   setSuccessMessage({ title, message });
  //   setTimeout(() => setSuccessMessage(null), 3000);
  // };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <StatsCards stats={stats} />
            
           <RecentComplaints
  complaints={complaints.slice(0, 6)}
  onComplaintClick={(complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  }}
  onFeedback={(complaint) => {
    setSelectedComplaint(complaint);
    setShowFeedbackModal(true);
  }}
/>


          </div>
        );
      case "new-complaint":
        return (
          <div className="file-complaint">
            <h2>File a New Complaint</h2>
            
             <ComplaintForm/>
          </div>
        );

      



      case "history":
        return (
          <div className="complaint-history">
            {/* <h2>Complaint History</h2> */}
            <ComplaintHistory
              onViewDetails={(complaint) => {
                setSelectedComplaint(complaint);
                setShowDetailsModal(true);
              }}
              onFeedback={(complaint) => {
                setSelectedComplaint(complaint);
                setShowFeedbackModal(true);
              }}
              onDelete={(complaint) => {
                setSelectedComplaint(complaint);
                setShowDeleteModal(true);
              }}
            />
          </div>
        );

      case "analytics":
        return (
          <div className="analytics-section">
            <h2>Analytics & Statistics</h2>
            <p className="section-message">Analytics feature coming soon!</p>
          </div>
        );
      case "settings":
        return (
          <div className="settings-section">
            <h2>Account Settings</h2>
            <p className="section-message">Settings feature coming soon!</p>
          </div>
        );
      case "help":
        return (
          <div className="help-section">
            <h2>Help & Support</h2>
            <p className="section-message">Help center coming soon!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="student-dashboard">
      <Header />
      <div className="dashboard-container">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="main-content">{renderContent()}</main>
      </div>

      {successMessage && (
        <div className="success-toast">
          <div className="success-toast-content">
            <div className="success-icon">✓</div>
            <div>
              <h4>{successMessage.title}</h4>
              <p>{successMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        isVisible={showFeedbackModal}
        complaintId={selectedComplaint?.id}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedComplaint(null);
        }}
        onSubmit={handleFeedbackSubmit}
      />

      <DeleteConfirmationModal
        isVisible={showDeleteModal}
        complaintId={selectedComplaint?.id}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedComplaint(null);
        }}
        onConfirm={() => handleComplaintDelete(selectedComplaint?.id)}
      />

      <ComplaintDetailsModal
        isVisible={showDetailsModal}
        complaint={selectedComplaint}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedComplaint(null);
        }}
      />
      <SuccessToastComponent />


      {/* Add any additional modals or components here */}
    </div>
  );
};

export default StudentDashboard;
