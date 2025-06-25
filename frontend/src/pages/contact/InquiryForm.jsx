import React from 'react';
import './Inquiry.css';

const InquiryForm = ({ handleSubmit, formData, handleInputChange }) => {
  return (
    <div className="inquiry-form-section">
      <h2>Submit Your Inquiry</h2>
      <form onSubmit={handleSubmit}>
        <div className="inquiry-form-group">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="inquiry-form-group">
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email/Phone Number"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="inquiry-form-group">
          <textarea
            id="question"
            name="inquiry"
            placeholder="Your Question"
            value={formData.inquiry}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="inquiry-submit-button">Submit</button>
      </form>
    </div>
  );
};

export default InquiryForm;
