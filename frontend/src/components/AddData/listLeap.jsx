import React from "react";

const LeapList = ({ items, onEdit, onDelete }) => {
  if (!items.length) return <p>No leaps available.</p>;

  return (
    <ul className="data-list">
      {items.map((leap) => (
        <li key={leap.id} className="data-list-item">
          <div>
            <strong>{leap.ep}</strong> — {leap.leap_category.replace("_", " ")}
          </div>
          <div className="data-list-actions">
            <button onClick={() => onEdit(leap)}>Edit</button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this leap?")) {
                  onDelete(leap.id);
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

export default LeapList;
