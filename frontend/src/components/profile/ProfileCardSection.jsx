// ProfileCardSection.jsx
import React from 'react';
import './profile-card.css';

const ProfileCardSection = ({
  title,
  children,
  isEditing,
  onToggleEdit,
  onCancelEdit,
  canEdit = true,
  onAddRow
}) => (
  <div className={`profile-whitecard ${isEditing ? 'edit-mode' : ''}`}>
    <h2 className="profile-section-title">{title}</h2>
    <div className="scroll-wrapper">{children}</div>
    {canEdit && (
      <div className="profile-button-group">
        {isEditing && onAddRow && (
          <button className={title.includes("Academic") ? "addStudy" : "addJob"} onClick={onAddRow}>Add New</button>
        )}
        {isEditing && (
          <button className="cancel" onClick={onCancelEdit}>Cancel</button>
        )}
        <button className="change" onClick={onToggleEdit}>{isEditing ? "Save" : "Edit"}</button>
      </div>
    )}
  </div>
);

export default ProfileCardSection;
