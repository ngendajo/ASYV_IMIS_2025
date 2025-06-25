import React, { useState } from 'react';
import useAuth from "../../hooks/useAuth";
import "./events-cards.css";
import EventModal from "./event-modal"; // make sure to create and import this

export const Event = ({
  alumni,
  title,
  e_datetime,
  location,
  description,
  image_url,
  onChange,
  onDelete,
  onSave,
  isNew,
  timeFunction
}) => {
  const { auth } = useAuth();

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const localDateTime = new Date(date.getTime() - offset * 60 * 1000);
    return localDateTime.toISOString().slice(0, 16);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newEDateTime, setNewEDateTime] = useState(formatDateTime(e_datetime));
  const [newLocation, setNewLocation] = useState(location);
  const [newImage, setNewImage] = useState(null);
  const [newDescription, setNewDescription] = useState(description);
  const [rsvped, setRsvped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!newTitle || !newEDateTime || !newLocation || !newDescription) {
      alert("All fields must be filled out.");
      return;
    }
    if (newDescription.length > 2000) {
      alert("Exceed character limit: 2000");
      return;
    }

    const eventData = new FormData();
    eventData.append('user', auth.user.id);
    eventData.append('title', newTitle);
    eventData.append('e_datetime', new Date(newEDateTime).toISOString());
    eventData.append('location', newLocation);
    if (newImage) eventData.append('image_url', newImage);
    eventData.append('description', newDescription);

    if (isNew) {
      onSave(eventData);
    } else {
      onChange(eventData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      onSave(null);
    } else {
      setIsEditing(false);
      setNewTitle(title);
      setNewEDateTime(formatDateTime(e_datetime));
      setNewLocation(location);
      setNewDescription(description);
    }
  };

  return (
    <>
      <div
        className={`events-card-container ${alumni === 'true' ? 'alumni' : ''}`}
        onClick={() => setShowModal(true)}
      >
        {isEditing || isNew ? (
          <form onSubmit={handleSave}>
            <input
              className="events-card-container-title"
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="datetime-local"
              value={newEDateTime}
              onChange={(e) => setNewEDateTime(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <textarea
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="event-char-count">
              Character Count: {newDescription.length}/2000
            </div>
            <div className="event-admin-actions">
              <button type="submit" className="eventpost">Post</button>
              <button onClick={handleCancel} className="eventedit">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="events-card-title">
              <p>{title}</p>
            </div>
            <p className="events-card-date">{timeFunction(e_datetime)}</p>
            {rsvped ? (
              <div className="events-card-btn" style={{ color: "var(--brown)", cursor: "default" }}>
                RSVP'd
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening modal
                  setRsvped(true);
                }}
                className="events-card-btn"
              >
                RSVP
              </button>
            )}
            {(auth.user.is_crc || auth.user.is_superuser) && alumni === 'false' && (
              <div className="event-admin-actions">
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="eventremove">Delete</button>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="eventedit">Edit</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <EventModal
          event={{
            title,
            e_datetime,
            location,
            description,
            image_url
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
