import React, { useState } from "react";
import { FaTools } from "react-icons/fa";
import {
  COMPLAINT_CATEGORIES,
  FILE_UPLOAD_CONFIG,
} from "../../utils/constants";
import "../../styles/ComplaintForm.css";
import {jwtDecode} from "jwt-decode";
import SuccessToast,{SuccessToastComponent} from "../common/SuccessToast";

export default function ComplaintForm({ onSubmitSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "Low",
    location: "",
    description: "",
    agreed: false,
    images: [],
  });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(
      (f) =>
        FILE_UPLOAD_CONFIG.acceptedTypes.includes(f.type) &&
        f.size <= FILE_UPLOAD_CONFIG.maxSize
    );
    if (valid.length + files.length > FILE_UPLOAD_CONFIG.maxFiles) {
      setErrors({ files: `Max ${FILE_UPLOAD_CONFIG.maxFiles} files allowed` });
      return;
    }
    setFiles((prev) => [...prev, ...valid]);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...valid] }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };
  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple front-end validation
    const errs = {};
    ["title", "category", "description"].forEach((f) => {
      if (!formData[f]) errs[f] = "Required";
    });
    if (!formData.agreed) errs.agreed = "You must confirm accuracy";
    if (Object.keys(errs).length) {
      console.warn("Validation errors:", errs);
      setErrors(errs);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ submit: "Authentication token not found. Please login." });
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Failed to decode token:", err);
      setErrors({ submit: "Invalid token. Please login again." });
      return;
    }

    const userPK = decoded.user_PK;
    const roll_number = decoded.roll_number;
    const room_FK = decoded.room_FK;

    // Derive location from room_FK as before
    const roomNumber = room_FK.toString();
    const blockCode = roomNumber[0];

    let location = "";
    if (["1", "2", "3", "4", "5"].includes(blockCode)) {
      location = `BH${blockCode}`;
    } else if (["6", "7", "8"].includes(blockCode)) {
      const ghNumber = parseInt(blockCode) - 5;
      location = `GH${ghNumber}`;
    } else {
      location = "unknown";
    }

    const payload = {
      room_FK: room_FK,
      title: formData.title,
      category: formData.category,
      priority: formData.priority,
      location,
      description: formData.description,
      submitted_by: roll_number,
      user_PK: userPK,
    };



    try {
      const res = await fetch("https://hostel-maintenance-system-backend.onrender.com/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // include token if backend requires auth header
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(res.statusText);

      const result = await res.json();


      // Notify other parts of app about update
      window.dispatchEvent(new Event("notificationsUpdated"));

 // Show success toast
      SuccessToast.show("Complaint Submitted", "Your complaint has been successfully filed.");

      // success callback
      onSubmitSuccess && onSubmitSuccess(result);

      // Reset form
      setFormData({
        title: "",
        category: "",
        priority: "Low",
        location: "",
        description: "",
        agreed: false,
        images: [],
      });
      setFiles([]);
      setErrors({});
    } catch (err) {
      console.error("Submit error:", err);
      setErrors({ submit: "Submission failed, try again." });
    }
  };

  return (
    <div className="file-complaint">
      <form className="complaint-form enhanced" onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-icon">
            <FaTools />
          </div>
          <div className="form-heading">
            <h3>File New Complaint</h3>
            <p>Please provide the details of your maintenance request</p>
          </div>
        </div>

        <div className="form-divider">
          <span className="divider-text">Basic Details</span>
        </div>

        <div className="form-group">
          <label>
            Title <span className="required-badge">Required</span>
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-enhanced"
            placeholder="Brief title"
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label>
            Category <span className="required-badge">Required</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="select-enhanced"
          >
            <option value="">--Select--</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error-message">{errors.category}</span>
          )}
        </div>

    

        <div className="form-divider">
          <span className="divider-text">Priority & Description</span>
        </div>

        <div className="form-group">
          <label className="label-text">
            Priority <span className="required-badge">Required</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="select-enhanced"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Description <span className="required-badge">Required</span>
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="textarea-enhanced"
            placeholder="Detailed description"
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="terms-checkbox">
          <input
            type="checkbox"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
          />
          I confirm the information is accurate
        </div>
        {errors.agreed && (
          <span className="error-message">{errors.agreed}</span>
        )}

        <div className="form-actions enhanced">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit Complaint
          </button>
        </div>
        {errors.submit && <p className="error-message">{errors.submit}</p>}
      </form>
    </div>
  );
}
