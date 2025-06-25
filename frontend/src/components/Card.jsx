
import React, { useState } from "react";
import "./Card.css";
import "./News.css";

export const Card = ({
  imgSrc,
  imgAlt,
  title,
  description,
  buttonText,
  link,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <div className="card-container">
      {imgSrc && imgAlt && (
        <img src={imgSrc} alt={imgAlt} className="card-img"  onHover= {openModal} />
      )}
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
      
      {buttonText && link && (
        <a href={link} className="card-btn">
          {buttonText}
        </a>
      )}
      {isModalOpen && (
        <div id="myModal" className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" id="img01" src={imgSrc} alt={imgAlt} />
          <div id="caption">{description}</div>
        </div>
      )}
    </div>
  );
};
