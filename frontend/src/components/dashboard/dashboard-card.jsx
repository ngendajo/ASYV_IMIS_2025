// components/dashboard/dashboard-card.jsx
import React from "react";
import "./dashboard-card.css";
import { Link } from "react-router-dom";

export const DashboardCard = ({ imgSrc, imgAlt, buttonText, path }) => {
  return (
    <div className="Dash-card-container">
      <div className="Dash-card-img-container">
        {imgSrc && (
          <img src={imgSrc} alt={imgAlt} className="Dash-card-img" />
        )}
      </div>
      {buttonText && (
        <Link to={path} className="Dash-card-btn">
          {buttonText}
        </Link>
      )}
    </div>
  );
};
