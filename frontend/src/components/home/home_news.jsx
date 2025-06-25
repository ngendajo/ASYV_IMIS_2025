import React from "react";
import { Link } from 'react-router-dom';
import "./home_news.css";

const getDateFromDateISOString = (datetimeString) => {
  const dateObj = new Date(datetimeString);
  const year = dateObj.getFullYear();
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const day = ('0' + dateObj.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export const News = ({
  imgSrc,
  imgAlt,
  title,
  description,
  date,
  link,
}

) => {
  return (
    <div className="News-card-container">


{imgSrc && link && (
        <img src={imgSrc} alt={imgAlt} className="News-card-img"onClick={link} >
        
        </img>
      )}
      {title && <p className="News-card-description">{title}</p>}
      {date && <p className="News-card-date"> {getDateFromDateISOString(date)} </p>}
    </div>
  );
};