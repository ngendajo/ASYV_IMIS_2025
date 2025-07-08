// OutcomeSummaryGrid.jsx
import React from 'react';
import './outcome-summary.css';

const OutcomeSummaryGrid = ({ summary }) => {
  return (
    <div className="summary-grid">
      <div className="summary-card">
        <h3>Total Alumni</h3>
        <p className="count">{summary.total_alumni}</p>
      </div>
      <div className="summary-card">
        <h3>Employed</h3>
        <p className="count">{summary.employment_total}</p>
        <p className="percent">{summary.employment_percent}%</p>
      </div>
      <div className="summary-card">
        <h3>Further Education </h3>
        <p className="count">{summary.further_education_total}</p>
        <p className="percent">{summary.further_education_percent}%</p>
      </div>
    </div>
  );
};

export default OutcomeSummaryGrid;
