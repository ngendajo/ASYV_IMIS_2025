// ProfileCardSection.jsx
import React, { useState } from 'react';
import './profile-card.css';

const ProfileCardSection = ({
  title,
  children,
  isEditing,
  onToggleEdit,
  onCancelEdit,
  canEdit = true,
  onAddRow
}) => {
  const [hasAddedRow, setHasAddedRow] = useState(false);

  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow();
      setHasAddedRow(true); // Hide the button after click
    }
  };

  const handleCancelEdit = () => {
    setHasAddedRow(false); // Reset when editing is canceled
    onCancelEdit();
  };

  const handleToggleEdit = () => {
    if (!isEditing) setHasAddedRow(false); // Reset when entering edit mode
    onToggleEdit();
  };

  return (
    <div className={`profile-whitecard ${isEditing ? 'edit-mode' : ''}`}>
      <h2 className="profile-section-title">{title}</h2>
      <div className="scroll-wrapper">{children}</div>
      {canEdit && (
        <div className="profile-button-group">
          {isEditing && onAddRow && !hasAddedRow && (
            <button
              className={title.includes("Academic") ? "addStudy" : "addJob"}
              onClick={handleAddRow}
            >
              Add New
            </button>
          )}
          {isEditing && (
            <button className="cancel" onClick={handleCancelEdit}>Cancel</button>
          )}
          <button className="change" onClick={handleToggleEdit}>
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCardSection;
