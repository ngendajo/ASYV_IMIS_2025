import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";

const LeapForm = ({ item, onSuccess, onCancel }) => {
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    ep: '',
    leap_category: 'club',
    recorded_by: auth?.user?.id || '',  // assume user info comes from context
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'science_center', label: 'Science Center' },
    { value: 'art_center', label: 'Art Center' },
    { value: 'sport', label: 'Sport' },
    { value: 'club', label: 'Club' },
    { value: 'programming', label: 'Programming' },
    { value: 'professional', label: 'Professional' },
  ];

  // If editing, load item into form
  useEffect(() => {
    if (item) {
      setFormData({
        ep: item.ep || '',
        leap_category: item.leap_category || 'club',
        recorded_by: item.recorded_by || auth?.user?.id,
      });
    }
  }, [item, auth?.user?.id]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (item?.id) {
        // Edit mode
        await axios.put(`${baseUrl}/leaps/${item.id}/`, formData);
      } else {
        // Create mode
        await axios.post(`${baseUrl}/leaps/`, formData);
      }
      onSuccess();  // refresh list
      setFormData({ ep: '', leap_category: 'club', recorded_by: auth?.user?.id });
    } catch (err) {
      console.error('Leap submission error:', err);
      setError('Something went wrong. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="data-form">
      <div className="form-group">
        <label>Name (ep):</label>
        <input
          type="text"
          name="ep"
          value={formData.ep}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Category:</label>
        <select
          name="leap_category"
          value={formData.leap_category}
          onChange={handleChange}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Hidden but submitted */}
      <input type="hidden" name="recorded_by" value={formData.recorded_by} />

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {item ? "Update" : "Add"}
        </button>
        {item && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>

      {error && <p className="error-msg">{error}</p>}
    </form>
  );
};

export default LeapForm;
