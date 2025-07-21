// src/components/social/EventModal.jsx
import React, { useState } from 'react';
import './event-modal.css';

const EventModal = ({
  event,
  onClose,
  isEditing = false,
  isNew = false,
  onSave,
  onChange,
  auth
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [e_datetime, setEDatetime] = useState(
    event?.e_datetime ? new Date(event.e_datetime).toISOString().slice(0, 16) : ''
  );
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !e_datetime || !location || !description) {
      alert("All fields are required.");
      return;
    }

    if (description.length > 2000) {
      alert("Exceed character limit: 2000");
      return;
    }

    const formData = new FormData();
    formData.append('user', auth.user.id);
    formData.append('title', title);
    formData.append('e_datetime', new Date(e_datetime).toISOString());
    formData.append('location', location);
    if (image) formData.append('image_url', image);
    formData.append('description', description);

    if (isNew) {
      onSave(formData);
    } else {
      onChange(formData);
    }

    onClose(); // close after saving
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="event-modal-content">
          {isEditing || isNew ? (
            <form onSubmit={handleSubmit} className="event-form">
               <label>
                Title<span className="required-asterisk">*</span>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Date & Time<span className="required-asterisk">*</span>
                <input
                  type="datetime-local"
                  value={e_datetime}
                  onChange={(e) => setEDatetime(e.target.value)}
                  required
                />
              </label>
              <label>
                Location<span className="required-asterisk">*</span>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </label>
              <label>
                Description<span className="required-asterisk">*</span>
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
              <label>
                Event Image (optional)
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              <div className="event-char-count">
                Character Count: {description.length}/2000
              </div>
              <div className="event-admin-actions">
                <button type="submit" className="eventpost">Save</button>
                <button type="button" onClick={onClose} className="eventedit">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="event-modal-text">
                <div className="event-title">{event.title}</div>
                <div className="event-date">
                  Date: {new Date(event.e_datetime).toLocaleDateString()}{" "}
                  {new Date(event.e_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="event-location">Location: {event.location}</div>
                <div className="event-text-container">
                  <p>{event.description}</p>
                </div>
              </div>
              <div className="event-modal-image">
                <img src={event.image_url} alt="Event Poster" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
