import React, { useEffect, useState }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Event } from '../../components/social/events-cards';
import './Events.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './EventsCalendar.css';


import axios from "axios";
import useAuth from "../../hooks/useAuth";

// import baseUrl from "../../api/baseUrl";
const  baseUrl='https://backend.asyv.ac.rw/api';

const EventsCalendar = () => {
  const [event, setEvent] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { auth } = useAuth();

  const getDateFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formatDateToMMDDYYYY = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };
  const formatDate = (dateObj) => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    return `${getOrdinalSuffix(day)} ${month}`;
  };
  
  const formatMonth = (dateObj) => {
    const options = { month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await axios.get(baseUrl+'/events/',{
        // headers: {
        //   "Authorization": 'Bearer ' + String(auth.accessToken),
        //   "Content-Type": 'multipart/form-data'
        // },
        // withCredentials:true
      });
      setEvent(response.data); 
    } catch(err) {
      console.log(err);
    }
  };

  useEffect(() =>{
    fetchCalendarEvents();
  });

  const eventsData = event;

  const onDateChange = date => {
    setSelectedDate(date);
  };

  const eventDate = event => getDateFromDateISOString(event.e_datetime);
  const selectedDateString = formatDateToMMDDYYYY(selectedDate);
  const eventsOnSelectedDate = eventsData.filter(
    event => eventDate(event) === selectedDateString
  );

  const noDate = original => {
    const [year, month, date] = original.split('-');
    return `${year}-${month}`;
  };
  const eventMonth = event => noDate(getDateFromDateISOString(event.e_datetime));
  const selectedMonthString = noDate(formatDateToMMDDYYYY(selectedDate));
  const eventsOnSelectedMonth = eventsData.filter(
    event => eventMonth(event) === selectedMonthString
  );

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      if (eventsData.find(event => eventDate(event) === formattedDate)) {
        return 'highlight';
      }
    }
    return null;
  };

  const handleDetail = (event) => {
    navigate('/events-detail', { state: { event } });
  };

  return (
    <div className="EventsCalendarContainer">
      <div className="HeadWrapper">
        <Link to="/events" className="card-view-button">Cards</Link>
        <Link to="/events-gallery" className="gallery-button">Photos</Link>
      </div>
      <div className="CalendarWrapper">
        <div className="calendar-side">
          <Calendar
            onChange={onDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            minDetail="month"
          />
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color event-day"></span>
              <span className="legend-text">Event Days</span>
            </div>
            <div className="legend-item">
              <span className="legend-color current-day"></span>
              <span className="legend-text">Selected Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-color today"></span>
              <span className="legend-text">Today</span>
            </div>
          </div>
        </div>
        <div className="events-side">
          {eventsOnSelectedDate.length > 0 ? (
            <>
              <div className="no-events">
                Events on {formatDate(selectedDate)}:
              </div>
              <div className="has-events">
              {eventsOnSelectedDate.map(event => (
                <Event
                  key={event.id}
                  alumni='true'
                  title={event.title}
                  e_datetime={event.e_datetime}
                  buttonText={event.buttonText}
                  link={() => handleDetail(event)}
                  timeFunction={(x) => getDateFromDateISOString(x)}
                />
              ))}
              </div>
            </>
          ) : (eventsOnSelectedMonth.length > 0 ? (
                <>
                  <div className="no-events">
                    No events on {formatDate(selectedDate)}. Here are events in {formatMonth(selectedDate)}:
                  </div>
                  <div className="has-events">
                  {eventsOnSelectedMonth.map(event => (
                    <Event
                      key={event.id}
                      alumni='true'
                      title={event.title}
                      e_datetime={event.e_datetime}
                      buttonText={event.buttonText}
                      link={() => handleDetail(event)}
                      timeFunction={(x) => getDateFromDateISOString(x)}
                    />
                  ))}
                  </div>
                </>
              ) : (
                  <div className="no-events">
                    No events in {formatMonth(selectedDate)}. Please select another date.
                  </div>)
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsCalendar;