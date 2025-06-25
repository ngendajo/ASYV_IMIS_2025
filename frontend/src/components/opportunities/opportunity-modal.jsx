// src/components/opportunities/opportunity-modal.jsx
import React, { useState, useEffect } from "react";
import "./opportunity-modal.css";

const OpportunityModal = ({
  opportunity,
  onClose,
  onSupportRequest,
  editMode = false,
  onSave,
  onDelete,
  onPostToggle
}) => {
  const [editing, setEditing] = useState(editMode);
  const [form, setForm] = useState(opportunity || {});

  useEffect(() => {
    if (opportunity) {
      setForm({ ...opportunity });
      setEditing(editMode);
    }
  }, [opportunity, editMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isStaff = !!onSave;

  if (!opportunity) return <></>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {editing ? (
          <>
            <div className="modal-field-row">
              <label>Title:</label>
              <input name="title" value={form.title} onChange={handleChange} />
            </div>

            <div className="modal-field-row">
              <label>Company:</label>
              <input name="organization" value={form.organization} onChange={handleChange} />
            </div>

            <div className="modal-field-row">
              <label>Description:</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="modal-field-row">
              <label>Deadline:</label>
              <input name="deadline" value={form.deadline} onChange={handleChange} />
            </div>

            <div className="modal-field-row">
              <label>Location:</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="modal-field-row">
              <label>Application Link:</label>
              <input name="link" value={form.link} onChange={handleChange} />
            </div>

            <div className="modal-buttons">
              <button onClick={() => onSave(form)}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            {!opportunity.approved && <span className="draft-label">Draft</span>}
            <h2>{opportunity.title}</h2>
            <p><strong>Company:</strong> {opportunity.organization}</p>
            <p><strong>Description:</strong> {opportunity.description}</p>
            <p><strong>Deadline:</strong> {opportunity.deadline}</p>
            <p><strong>Location:</strong> {opportunity.location}</p>
            <p><strong>Application:</strong> {opportunity.link}</p>

            <div className="modal-buttons">
              {isStaff ? (
                <>
                  <button onClick={() => setEditing(true)}>Edit</button>
                  <button onClick={onDelete}>Delete</button>
                  <button onClick={onPostToggle}>
                    {opportunity.approved ? "Hide" : "Post"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => window.open(opportunity.link, "_blank")}>Apply</button>
                  <button className="support" onClick={() => onSupportRequest(opportunity)}>
                    Request CRC Support
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OpportunityModal;
