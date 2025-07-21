import React from "react";

const StaffList = ({ items, onEdit, onDelete }) => {
  if (!items.length) return <p>No staff members available.</p>;

  return (
    <ul className="data-list">
      {items.map((member) => (
        <li key={member.id} className="data-list-item">
          <div>
            <strong>{member.first_name}</strong> — {member.rwandan_name}
            {member.email && (
              <>
                <br />
                <span>{member.email}</span>
              </>
            )}
          </div>
          <div className="data-list-actions">
            <button onClick={() => onEdit(member)}>Edit</button>
            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm("Delete this staff member?")) {
                  onDelete(member.id);
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

export default StaffList;
