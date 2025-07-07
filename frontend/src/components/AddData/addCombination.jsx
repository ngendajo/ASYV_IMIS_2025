import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import baseUrl from '../../api/baseUrl';

const CombinationForm = ({ item, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    combination_name: '',
    abbreviation: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (item) {
      setFormData({
        combination_name: item.combination_name || '',
        abbreviation: item.abbreviation || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    if (!item?.id) {
      const confirmed = window.confirm("Are you sure you want to create this combination?");
      if (!confirmed) return;
    }
  
    setSubmitting(true);
  
    try {
      if (item?.id) {
        await axios.put(`${baseUrl}/combinations/${item.id}/`, formData);
        setSuccessMessage("Updated successfully.");
      } else {
        await axios.post(`${baseUrl}/combinations/`, formData);
        setSuccessMessage("Created successfully.");
      }
  
      if (onSuccess) onSuccess();
  
      // Clear form after creation
      setFormData({ combination_name: '', abbreviation: '' });
  
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error submitting combination:', err);
      setError('Error creating/updating combination. Check fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="data-form">
      <div className="form-group">
        <label>Combination Name:</label>
        <input
          type="text"
          name="combination_name"
          value={formData.combination_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Abbreviation:</label>
        <input
          type="text"
          name="abbreviation"
          value={formData.abbreviation}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {item ? 'Update' : 'Submit'}
        </button>
        {item && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>

      {error && <p className="error-msg">{error}</p>}
      {successMessage && <p className="success-msg">{successMessage}</p>}

    </form>
  );
};

export default CombinationForm;
