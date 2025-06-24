import React, { useState } from "react";
import ComplaintsTable from "./ComplaintsTable";
import ComplaintDetailsModal from "../modals/ComplaintDetailsModal";
import axios from "axios";

const Complaints = ({ complaints, handleAssignEngineer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [complaintDetailsModal, setComplaintDetailsModal] = useState({
    visible: false,
    complaint: null,
  });
// /complaints/with-assignees/:id
  const handleViewComplaintDetails = async (complaintId) => {
    try {
      const response = await axios.get(`https://hostel-maintenance-system-backend.onrender.com/api/admin/complaints/with-assignees/${complaintId}`);
      setComplaintDetailsModal({
        visible: true,
        complaint: response.data,
      });

    } catch (error) {
      console.error("Failed to fetch complaint details:", error);
    }
  };

  return (
    <div className="admin-dashboard-complaints-container">
      <div className="admin-dashboard-section-header">
        <h2 className="admin-dashboard-section-title">Maintenance Complaints</h2>
        <p className="admin-dashboard-section-subtitle">
          Manage and track all maintenance requests from students
        </p>
      </div>

      <div className="admin-dashboard-card">
        <ComplaintsTable
          complaints={complaints}
          handleViewDetails={handleViewComplaintDetails}
          handleAssignEngineer={handleAssignEngineer}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {complaintDetailsModal.visible && complaintDetailsModal.complaint && (
        <div className="admin-dashboard-modal-overlay">
          <ComplaintDetailsModal
            complaint={complaintDetailsModal.complaint}
            onClose={() =>
              setComplaintDetailsModal({ visible: false, complaint: null })
            }
          />
        </div>
      )}
    </div>
  );
};

export default Complaints;
