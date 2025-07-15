import React, { useState } from 'react';
import './contact-card.css';
import ProfileImage from '../dashboard/ProfileImage'; // use the working image component

const ContactCard = ({ user, editable = false }) => {
  const [hover, setHover] = useState(false);
  console.log("passed in", user)

  // use the correct model fields
  const name = `${user?.data.first_name || ''} ${user?.data.rwandan_name || ''}`.trim();
  const email = user?.data.email || user?.data.email1 || "Email not available";
  const phone = user?.data.phone || user?.data.phone1 || "Phone not available";

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
          <div className="contact-name">{name || "Name not available"}</div>
          <div className="contact-line">{email}</div>
          <div className="contact-line">{phone}</div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
