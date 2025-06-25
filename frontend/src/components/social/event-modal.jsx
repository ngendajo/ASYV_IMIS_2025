// src/components/social/EventModal.jsx
import React from 'react';
import './event-modal.css';

const EventModal = ({ event, onClose }) => {
  const getDateFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const getTimeFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    return dateObj.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="event-modal-content">
          <div className="event-modal-text">
            <div className="event-title">{event.title}</div>
            <div className="event-date">Date: {getDateFromDateISOString(event.e_datetime)} {getTimeFromDateISOString(event.e_datetime)}</div>
            <div className="event-location">Location: {event.location}</div>
            <div className="event-text-container">
              <p>{event.description}</p>
            </div>
          </div>
          <div className="event-modal-image">
            <img src={event.image_url} alt="Event Poster" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
