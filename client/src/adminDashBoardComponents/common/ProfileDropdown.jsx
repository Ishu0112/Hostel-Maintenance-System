import React, { forwardRef, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const ProfileDropdown = forwardRef(
  ({ adminProfile, visible, onLogout }, ref) => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (!visible) return;

      const fetchAdminProfile = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
          }

          let decodedToken;
          try {
            decodedToken = jwtDecode(token);
          } catch (err) {
            setError("Invalid authentication token");
            setLoading(false);
            return;
          }

          // Use the user_PK from token to fetch admin details
          const userPk = decodedToken.user_PK;
         

          // If not, fetch from server (your API endpoint might be different)
          const response = await axios.get(
            `https://hostel-maintenance-system-backend.onrender.com/api/admin/profile/${userPk}`
          );

          setAdminData(
            response.data.profile 
          );
          setLoading(false);
        } catch (err) {
          console.error("Error fetching admin profile:", err);
          // Fallback to the passed prop or default values if fetch fails
          setAdminData(
            adminProfile || {
              name: "Admin User",
              email: "admin@iiita.ac.in",
              role: "Administrator",
            }
          );
          setLoading(false);
        }
      };

      fetchAdminProfile();
    }, [visible, adminProfile]);

    if (!visible) return null;

    if (loading) {
      return (
        <div className="admin-profile-dropdown" ref={ref}>
          <div className="admin-profile-dropdown-loading">
            <p>Loading profile...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="admin-profile-dropdown" ref={ref}>
          <div className="admin-profile-dropdown-error">
            <p>{error}</p>
          </div>
        </div>
      );
    }

    const profile = adminData || adminProfile;

    return (
      <div className="admin-profile-dropdown" ref={ref}>
        <div className="admin-profile-dropdown-header">
          <div className="admin-profile-dropdown-avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                profile.name
              )}&background=3f51b5&color=fff&bold=true`}
              alt="Admin Profile"
            />
          </div>
          <div className="admin-profile-dropdown-info">
            <h4 className="admin-profile-dropdown-name">{profile.name}</h4>
            {/* <p className="admin-profile-dropdown-role">Adminis trator</p> */}
            {/* <p className="admin-profile-dropdown-email">{profile.email}</p> */}
          </div>
        </div>

        <div className="admin-profile-dropdown-body">
          <div className="admin-profile-dropdown-item">
               <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6" />
    </svg>
            <p className="admin-profile-dropdown-email">{profile.email}</p>

          </div>
          <div className="admin-profile-dropdown-item">
               <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.88 19.88 0 0 1-8.63-3.11A19.5 19.5 0 0 1 3.11 10.8 19.88 19.88 0 0 1 0 2.18 2 2 0 0 1 2.18 0H6.28a2 2 0 0 1 2 1.72 12.11 12.11 0 0 0 .7 2.85 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 8 8l2.23-1.43a2 2 0 0 1 2.11-.45 12.11 12.11 0 0 0 2.85.7 2 2 0 0 1 1.72 2z"></path>
    </svg>
            <p className="admin-profile-dropdown-email">{profile.phone}</p>

          </div>
          <div
            className="admin-profile-dropdown-item logout"
            onClick={onLogout}
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </div>
        </div>
      </div>
      
    );
  }
);

export default ProfileDropdown;
