


import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaClock,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";

const StatsCards = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setError("Authentication error — no token found");
          setLoading(false);
          return;
        }

        let decodedToken;
        try {
          decodedToken = jwtDecode(token);
        } catch (err) {
          console.error("Invalid token:", err);
          setError("Authentication error — invalid token");
          setLoading(false);
          return;
        }

        const roll_number = decodedToken.roll_number;

        const res = await axios.get("/api/complaint-history", {
          params: { roll_number },
          headers: { Authorization: `Bearer ${token}` },
        });

        const complaints = res.data;

        console.log(
          "Complaint statuses:",
          complaints.map((c) => c.status)
        );

        const normalized = complaints.map((c) => ({
          ...c,
          status: c.status.toLowerCase(),
        }));

        const total = normalized.length;
        const pending = normalized.filter((c) => c.status === "Pending").length;
        const resolved = normalized.filter((c) => c.status === "Completed").length;
        const inProgress = total - pending - resolved;

        setStats({ total, pending, inProgress, resolved });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-cards">
        <p>Loading stats…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-cards">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: <FaClipboardList />,
      color: "var(--primary-color)",
      description: "All filed complaints",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <FaClock />,
      color: "var(--warning-color)",
      description: "Waiting for action",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: <FaSpinner />,
      color: "var(--secondary-color)",
      description: "Currently being resolved",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: <FaCheckCircle />,
      color: "var(--success-color)",
      description: "Completely resolved",
    },
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="stat-card enhanced"
          style={{ borderColor: card.color }}
        >
          <div className="stat-info">
            <h3>{card.title}</h3>
            <p className="stat-description">{card.description}</p>
            <div className="stat-number" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
          <div
            className="stat-icon"
            style={{ backgroundColor: `${card.color}15`, color: card.color }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
