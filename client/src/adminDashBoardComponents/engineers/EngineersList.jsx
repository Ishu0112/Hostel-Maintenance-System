import React, { useState, useEffect } from "react";
import axios from "axios";

const EngineersList = ({
  handleEngineerDetails,
  handleDeleteEngineer,
  showToast,
  refreshEngineers,
  engineers: engineersFromProps,
}) => {
  const [engineers, setEngineers] = useState([]);
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Use engineers from props if provided
  useEffect(() => {
    if (engineersFromProps && engineersFromProps.length > 0) {
      setEngineers(engineersFromProps);
    } else {
      // Fallback to fetching engineers if not provided in props
      const fetchEngineers = async () => {
        try {
          const res = await axios.get(
            "https://hostel-maintenance-system-backend.onrender.com/api/admin/engineers",
            { withCredentials: true }
          );

          setEngineers(res.data);
        } catch (err) {
          console.error("Failed to fetch engineers:", err);
        }
      };
      fetchEngineers();
    }
  }, [engineersFromProps]);

  // Filter engineers whenever inputs change
  useEffect(() => {
    let results = [...engineers];

    if (searchTerm) {
      results = results.filter(
        (engineer) =>
          engineer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSpecialization) {
      results = results.filter(
        (engineer) => engineer.specialization === filterSpecialization
      );
    }

    if (filterStatus) {
      results = results.filter((engineer) => engineer.status === filterStatus);
    }

    setFilteredEngineers(results);
  }, [engineers, searchTerm, filterSpecialization, filterStatus]);

  const specializations = [
    ...new Set(engineers.map((e) => e.specialization)),
  ].filter(Boolean);
  const statuses = [...new Set(engineers.map((e) => e.status))].filter(Boolean);

  return (
    <div className="admin-dashboard-engineers-container">
      <div className="admin-dashboard-section-header">
        <h2 className="admin-dashboard-section-title">Maintenance Engineers</h2>
        <p className="admin-dashboard-section-subtitle">
          Manage your engineering staff and monitor their assignments
        </p>
      </div>

      <div className="admin-dashboard-card">
        <div className="admin-dashboard-card-header">
          <h3 className="admin-dashboard-card-title">Engineers List</h3>
        </div>

        <div className="admin-dashboard-filters-container">
          <div className="admin-dashboard-input-icon-wrapper">
            <span className="admin-dashboard-input-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-dashboard-search-input"
            />
          </div>

          {/* <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="admin-dashboard-filter-select"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select> */}
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="admin-dashboard-filter-select"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec, idx) => (
              <option key={`${spec}-${idx}`} value={spec}>
                {spec}
              </option> // ✅ FIXED: Added unique key fallback
            ))}
          </select>

          {/* <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-dashboard-filter-select"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select> */}

          {/* <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-dashboard-filter-select"
          >
            <option value="">All Statuses</option>
            {statuses.map((status, idx) => (
              <option key={`${status}-${idx}`} value={status}>
                {status}
              </option> // ✅ FIXED: Added unique key fallback
            ))}
          </select> */}
        </div>

        {filteredEngineers.length > 0 ? (
          <div className="admin-dashboard-table-responsive">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEngineers.map((engineer) => (
                  <tr key={engineer.id}>
                    <td>
                      <div className="admin-dashboard-engineer-name">
                        <div className="admin-dashboard-engineer-avatar">
                          {engineer.name?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <span>{engineer.name}</span>
                      </div>
                    </td>
                    <td>{engineer.email}</td>
                    <td>{engineer.phone}</td>
                    <td>
                      <span className="admin-dashboard-specialization-badge">
                        {engineer.specialization}
                      </span>
                    </td>
                    {/* <td>
                      <span
                        className={`admin-dashboard-status-indicator ${
                          engineer.status === "Available"
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        {engineer.status}
                      </span>
                    </td> */}
                    <td>
                      <button
                        className="admin-dashboard-btn admin-dashboard-view-btn"
                        onClick={() => handleEngineerDetails(engineer.user_FK)}
                      >
                        View Details
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-dashboard-btn admin-dashboard-delete-btn"
                        style={{
                          marginLeft: "8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                        }}
                        onClick={async () => {
                          const success = await handleDeleteEngineer(
                            engineer.user_FK
                          );
                          if (success) {
                            showToast("Engineer deleted successfully");
                            // The list will be refreshed automatically through props
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-dashboard-empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#ccc", marginBottom: "1rem" }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p className="admin-dashboard-empty-text">
              No engineers found matching your search criteria
            </p>
            <button
              className="admin-dashboard-btn"
              onClick={() => {
                setSearchTerm("");
                setFilterSpecialization("");
                setFilterStatus("");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineersList;
