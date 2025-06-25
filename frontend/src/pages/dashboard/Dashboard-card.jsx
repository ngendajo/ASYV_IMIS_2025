
import React, { useState } from "react";
import "./Dashboard-card.css";
import { Link } from "react-router-dom";

export const DashboardCard = ({
  imgSrc,
  imgAlt,
  buttonText,

  path,
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
    <div className="Dash-card-container">
      {imgSrc && imgAlt && (
        <img src={imgSrc} alt={imgAlt} className="Dash-card-img"  onHover= {openModal} />
      )}
       
     

{buttonText && (
        <Link to ={path} className="Dash-card-btn">
          {buttonText}
        </Link>
      )}

      {isModalOpen && (
        <div id="myModal" className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" id="img01" src={imgSrc} alt={imgAlt} />
        
        </div>
      )}
    </div>
  );
};
