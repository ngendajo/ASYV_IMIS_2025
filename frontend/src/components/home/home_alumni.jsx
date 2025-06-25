import React from "react";
import "./home_alumni.css";

export const Alumni = ({
  imgSrc,
  imgAlt,
  title,
  description,
  buttonText="READ MORE",
  link,
}) => {

  return (
    <div className="Alumni-card-container">
      {imgSrc && imgAlt && (
        <img src={imgSrc} alt={imgAlt} className="Alumni-card-img" />
      )}
      {title && <h3 className="Alumni-card-title">{title}</h3>}
    
      {description && <p className="Alumni-card-description">{description}</p>}
      
      {buttonText && link && (
        <button onClick={link} className="Alumni-card-btn">
          {buttonText}
        </button>
      )}
    </div>
  );
};