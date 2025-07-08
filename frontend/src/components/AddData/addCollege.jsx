import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";

const CollegeForm = ({ item, onSuccess, onCancel }) => {
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    college_name: "",
    country: "",
    city: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // If editing, load existing college data
  useEffect(() => {
    if (item) {
      setFormData({
        college_name: item.college_name || "",
        country: item.country || "",
        city: item.city || "",
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Confirm only on creation
    if (!item?.id) {
      const confirmed = window.confirm("Are you sure you want to create this college?");
      if (!confirmed) return;
    }

    setSubmitting(true);

    try {
      if (item?.id) {
        await axios.put(`${baseUrl}/colleges/${item.id}/`, formData, {
          headers: { Authorization: "Bearer " + auth.accessToken },
          withCredentials: true,
        });
        setSuccessMessage("Updated successfully.");
      } else {
        await axios.post(`${baseUrl}/colleges/`, formData, {
          headers: { Authorization: "Bearer " + auth.accessToken },
          withCredentials: true,
        });
        setSuccessMessage("Created successfully.");
      }

      onSuccess();
      setFormData({ college_name: "", country: "", city: "" });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("College submission error:", err);
      setError("Something went wrong. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="data-form">
      <div className="form-group">
        <label>College Name:</label>
        <input
          type="text"
          name="college_name"
          value={formData.college_name}
          onChange={handleChange}
          required
          placeholder="Enter college name"
        />
      </div>

      <div className="form-group">
        <label>Country:</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          placeholder="Enter country"
        />
      </div>

      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Enter city"
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {item ? "Update" : "Add"}
        </button>
        {item && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}
      {successMessage && <p className="success-msg">{successMessage}</p>}
    </form>
  );
};

export default CollegeForm;
