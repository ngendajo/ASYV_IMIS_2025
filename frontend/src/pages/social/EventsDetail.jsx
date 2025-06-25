import React from 'react';
import './EventsDetail.css';
import { useNavigate, useLocation} from 'react-router-dom';

const EventsDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventDetail = location.state?.event;
  
  const getDateFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };
  
  const getTimeFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedTime;
  };

  return (
    <div className="event-wrapper">
      <div className="event-content">
        <div className="event-header">
          <div className="event-title">{eventDetail.title}</div>
          <div className="event-date">Date: {getDateFromDateISOString(eventDetail.e_datetime)} {getTimeFromDateISOString(eventDetail.e_datetime)}</div>
          <div className="event-location">Location: {eventDetail.location}</div>
        </div>
        <div className="event-text-container">
          <p>{eventDetail.description}</p>
        </div>
      </div>
      <div className="event-poster">
        <img src={eventDetail.image_url} alt="Event poster" ></img>
      </div>
      <button onClick={() => navigate(-1)}>Back &gt;</button>
    </div>
  );
};

export default EventsDetail;