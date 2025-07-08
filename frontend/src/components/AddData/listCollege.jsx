import React from "react";

const CollegeList = ({ items, onEdit, onDelete }) => {
  if (!items.length) return <p>No colleges available.</p>;

  return (
    <ul className="data-list">
      {items.map((college) => (
        <li key={college.id} className="data-list-item">
          <div>
            <strong>{college.college_name}</strong> — {college.city}, {college.country}
          </div>
          <div className="data-list-actions">
            <button onClick={() => onEdit(college)}>Edit</button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this college?")) {
                  onDelete(college.id);
                }
              }}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CollegeList;
