import React, { useState } from 'react';
import './contact-card.css';
import ProfileImage from '../dashboard/ProfileImage';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import useAuth from '../../hooks/useAuth';

const ContactCard = ({ user, editable = false }) => {
  const { auth } = useAuth();
  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.data.first_name || '',
    rwandan_name: user?.data.rwandan_name || '',
    email: user?.data.email || user?.data.email1 || '',
    phone: user?.data.phone || user?.data.phone1 || '',
  });

  const fullName = `${formData.first_name} ${formData.rwandan_name}`.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.data.first_name || '',
      rwandan_name: user?.data.rwandan_name || '',
      email: user?.data.email || user?.data.email1 || '',
      phone: user?.data.phone || user?.data.phone1 || '',
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const updatedUser = {
        email: formData.email,
        phone: formData.phone,
      };

      console.log("userid", user.data.id); 
      console.log("updated contact", updatedUser);
  
      await axios.patch(baseUrl + `/users/${user.data.id}/`, updatedUser, {
        headers: {
          Authorization: 'Bearer ' + auth.accessToken, 
        },
      });
  
      alert("Contact info saved!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save contact info:", err);
      alert("Failed to save contact info.");
    }
  };

  return (
    <div className="ContactWrapper">
      <div className="contact-card">
        <div
          className="contact-pic-wrapper"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <ProfileImage user={user} canEdit={editable} size={100} />
        </div>

        <div className="contact-info">
          <div className="contact-header">
            <div className="contact-name">
              {fullName || "Name not available"}
            </div>
          </div>

          <div className="contact-line">
            {isEditing ? (
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            ) : (
              formData.email || "Email not available"
            )}
          </div>

          <div className="contact-line">
            {isEditing ? (
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
              />
            ) : (
              formData.phone || "Phone not available"
            )}
          </div>

          <div>
            {editable && !isEditing && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;