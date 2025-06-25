// src/components/opportunities/opportunity-card.jsx
import React, { useState } from "react";
import "./opportunity-card.css";
import "./opportunity-modal.css";

const OpportunityCard = ({
  title,
  description,
  date,
  location,
  link,
  company,
  onSupportRequest,
  renderActions,
  onClick,
  draft = false
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (e) => {
    if (e.target.tagName === "BUTTON") return;
    if (onClick) return onClick(); // allow parent to override modal logic
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const truncatedDescription = description.length > 120
    ? description.slice(0, 120) + "..."
    : description;

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (link) window.open(link, "_blank");
  };

  const handleSupportRequest = (e) => {
    e.stopPropagation();
    if (onSupportRequest) {
      onSupportRequest({ title, company, date, link });
    } else {
      alert("Support request submitted!");
    }
  };

  return (
    <>
      <div className="opportunity-card" onClick={handleCardClick}>
        <div className="card-top-row">
          <h3 className="card-title">{title}</h3>
          {draft && <span className="draft-label">Draft</span>}
          {date && <p className="card-date">Apply by: {date}</p>}
        </div>
        {company && <p className="card-subtitle">{company}</p>}
        <p className="card-description">{truncatedDescription}</p>
        {location && <p className="card-meta">Location: {location}</p>}

        <div className="card-actions">
          {renderActions ? (
            renderActions()
          ) : (
            <>
              <button onClick={() => window.open(link, "_blank")}>Apply</button>
              <button className="support" onClick={handleSupportRequest}>
                Request CRC Support
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alumni fallback modal (staff modal is now external) */}
      {!onClick && showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <h2>{title}</h2>
            {company && <p><strong>Company:</strong> {company}</p>}
            <p><strong>Description:</strong> {description}</p>
            {location && <p><strong>Location:</strong> {location}</p>}
            {date && <p><strong>Apply by:</strong> {date}</p>}

            <div className="modal-buttons">
              <button onClick={handleApplyClick}>Apply</button>
              <button className="support" onClick={handleSupportRequest}>
                Request CRC Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpportunityCard;
