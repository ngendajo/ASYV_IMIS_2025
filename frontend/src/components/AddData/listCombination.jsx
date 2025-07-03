import React from "react";

const CombinationList = ({ items, onEdit, onDelete }) => {
  if (!items.length) return <p>No combinations available.</p>;

  return (
    <ul className="data-list">
      {items.map((combo) => (
        <li key={combo.id} className="data-list-item">
          <div>
            <strong>{combo.combination_name}</strong> — {combo.abbreviation}
          </div>
          <div className="data-list-actions">
            <button onClick={() => onEdit(combo)}>Edit</button>
            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm("Delete this combination?")) {
                  onDelete(combo.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CombinationList;
