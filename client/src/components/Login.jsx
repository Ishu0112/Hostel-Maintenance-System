import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

const Login = () => {
  const [rollno, setRollno] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const showSuccessAlert = (message) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const allowedPrefixes = [
    "IIT",
    "IIB",
    "IEC",
    "IMB",
    "IFI",
    "RSM",
    "MML",
    "MDE",
    "MRM",
    "MSE",
    "MWC",
    "MHC",
    "PMM",
    "PMD",
    "PMS",
  ];

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isNumeric = /^\d+$/.test(rollno);
      const normalizedRollno = rollno.toUpperCase();
      

      // 👉 Case 1: Engineer/Admin Login (numeric rollno)
      if (isNumeric) {
        const res = await axios.post("https://hostel-maintenance-system-backend.onrender.com/api/login", {
          user_PK: rollno,
          password,
        });

        if (res.status === 200) {
          const { token, role } = res.data;

          localStorage.setItem("token", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          showSuccessAlert();

          if (role === "admin") {
            navigate("/AdminDashboard");
          } else if (role === "engineer") {
            navigate("/EngineerDashboard");
          } else {
            setError("Unauthorized role");
          }
          return;
        }
      }

      // 👉 Case 2: Student Login (roll number with prefix)
      if (
        allowedPrefixes.some((prefix) => normalizedRollno.startsWith(prefix))
      ) {
        const res = await axios.post("https://hostel-maintenance-system-backend.onrender.com/api/login", {
          rollno,
          password,
        });


        if (res.status === 200) {
          const { token, role } = res.data;

          localStorage.setItem("token", token);
          showSuccessAlert();

          navigate("/StudentDashboard");
          return;
        }
      }

      // 👉 If none of the above matched
      setError("Invalid roll number or password");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid roll number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Header */}
      <header className="login-header-main">
        <div className="login-header-welcome-banner">
          <h1 className="login-welcome-heading">
            Welcome to IIIT-A Maintenance System
          </h1>
          
          <div className="login-welcome-divider"></div>
        </div>
      </header>

      {/* Success Alert */}
      {showSuccess && (
        <div className="login-success-alert">
          <svg
            viewBox="0 0 24 24"
            className="login-success-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="login-success-text">
            Login successful! Redirecting...
          </span>
        </div>
      )}

      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-left-panel">
            <div className="login-brand-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="login-logo-icon"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="login-welcome-title">IIIT-A Maintenance System</h1>
            <p className="login-welcome-subtitle">
              Your efficient solution for hostel maintenance requests and
              facility management
            </p>
            <div className="login-features-list">
              <div className="login-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  className="login-feature-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quick issue reporting</span>
              </div>
              <div className="login-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  className="login-feature-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real-time tracking</span>
              </div>
              <div className="login-feature-item">
                <svg
                  viewBox="0 0 24 24"
                  className="login-feature-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Efficient resolution</span>
              </div>
            </div>
          </div>

          <div className="login-right-panel">
            <div className="login-card">
              <div className="login-header">
                <h2 className="login-title">Sign In</h2>
                <p className="login-subtitle">
                  Enter your credentials to access the portal
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="login-error-alert">
                  <svg
                    viewBox="0 0 24 24"
                    className="login-error-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-form-group">
                  <label htmlFor="rollno" className="login-form-label">
                    Roll Number / Employee ID
                  </label>
                  <div className="login-input-container">
                    <svg
                      viewBox="0 0 24 24"
                      className="login-input-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="rollno"
                      type="text"
                      className="login-form-input"
                      placeholder="Enter your roll number or employee ID"
                      value={rollno}
                      onChange={(e) => setRollno(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="password" className="login-form-label">
                    Password
                  </label>
                  <div className="login-input-container">
                    <svg
                      viewBox="0 0 24 24"
                      className="login-input-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <circle cx="12" cy="16" r="1" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      id="password"
                      type="password"
                      className="login-form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-footer">
                  <button
                    type="submit"
                    className={`login-button ${loading ? "login-loading" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="login-spinner"></span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="login-help-text">
                    {/* <p>
                      Need help? Contact IT Support:{" "}
                      <a href="mailto:support@iiita.ac.in">support@iiita.ac.in</a>
                    </p> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="login-footer-main">
        <div className="login-footer-simple">
          <h3 className="login-footer-title">IIIT-A Maintenance Portal</h3>
          <p className="login-footer-subtitle">
            Empowering efficient facility management • Contact IT Support:
            support@iiita.ac.in
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
