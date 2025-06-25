import React, {useState} from "react";
import useAuth from "../../hooks/useAuth";
import { Link } from 'react-router-dom';
import "./photo-cards.css";

export const PhotoCard = ({
  alumni, image_url, title, date, link,
  onChange, onDelete, onSave, isNew
}) => {

  const { auth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [newImage, setNewImage] = useState(null);
  const [newTitle, setNewTitle] = useState(title);
  const [newDate, setNewDate] = useState(date)
  const [newLink, setNewLink] = useState(link);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
  };

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleSave = async (event) => {
    event.preventDefault(); 
    if (!newImage || !newTitle || !newDate || !newLink) {
      alert("All fields must be filled out.");
      return;
    }
    const photoData = new FormData();
    photoData.append('user', auth.user.id)
    photoData.append('image_url', newImage)
    photoData.append('event_name', newTitle)
    photoData.append('createdat', newDate)
    photoData.append('link', newLink)

    if (isNew) {
      onSave(photoData);
    } else {
      onChange(photoData);
      setIsEditing(false)
    }
  };
  
  const handleCancel = () => {
    if (isNew) {
      onSave(null);
    } else {
      setIsEditing(false);
      setNewTitle(title);
      setNewDate(date);
      setNewLink(link);
    }
  };

  return (
    <div className={`photo-card-container ${isEditing || isNew ? "edit" : alumni==='true' ? 'alumni' : ''}`}>
      {isEditing || isNew ? (
        <form onSubmit={handleSave}>
          <input
            className="photo-card-container-title"
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange} 
          />
          <input
            className="photo-card-container-image"
            type="text"
            placeholder="Photo Album Link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <div className="photo-admin-actions">
            {isEditing && <button type="submit" className="photopost">Post</button>}
            {isNew && <button type="submit" className="photopost">Post</button>}
            <button onClick={handleCancel} className="photoedit">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {image_url && link && (
            <Link to={link} target="_blank" rel="noopener noreferrer" className="photo-card-link" >
            {  <img src={image_url} alt="Album cover" className="photo-card-img" />}
            </Link>
          )}
          {title && <p className="photo-card-title">{title}</p>}
          {date && <p className="photo-card-date">{date}</p>}
          {(auth.user.is_crc || auth.user.is_superuser) && alumni==='false' && (
            <div className="photo-admin-actions">
              <button onClick={onDelete} className="photoremove">Delete</button>
              <button onClick={handleEdit} className="photoedit">Edit</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};