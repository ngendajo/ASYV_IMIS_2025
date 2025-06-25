import React, { useEffect, useState }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/dashboard/search-bar';
import { Event } from '../../components/social/events-cards';
import './Events.css';
import axios from "axios";
import useAuth from "../../hooks/useAuth";

// import baseUrl from "../../api/baseUrl";
const  baseUrl='https://backend.asyv.ac.rw/api';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState([]);
  const [creatingNew, setCreatingNew] = useState(false);

  const getDateFromDateISOString = (datetimeString) => {
    const dateObj = new Date(datetimeString);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(baseUrl+'/events/',{
        // headers: {
        //   "Authorization": 'Bearer ' + String(auth.accessToken),
        //   "Content-Type": 'multipart/form-data'
        // },
        // withCredentials:true
      });
      setEvent(response.data); 
      console.log(response.data)
    } catch(err) {
      console.log(err);
    }
  };

  useEffect(() =>{
    fetchEvents();
  });

  const eventsData = event;

  // Filter events based on search query
  const filteredEvents = eventsData.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetail = (event) => {
    navigate('/events-detail', { state: { event } });
  };

  // Edit, add, delete
  const handleSaveEdit = async (eventId, eventData) => {
    try {
      await axios.put(baseUrl + "/events/" + eventId + "/", eventData,
        {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          }
        }
      ).then(res => {
        console.log(res);
        alert("Posted successfully");
        fetchEvents();
      }).catch(error => console.log(error.response.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateNew = async (eventData) => {
    if (eventData === null) {
      setCreatingNew(false);
      return;
    }
    try {
      await axios.post(baseUrl + "/events/", eventData,
        {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          }
        }
      ).then(res => {
        console.log(res);
        alert("Created successfully");
        fetchEvents();
        setCreatingNew(false);
      }).catch(error => console.log(error.response.data));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
        if (!confirmed) {
            return;
        }
    try {
      await axios.delete(baseUrl + "/events/" + eventId + "/", {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'application/json'
        }
      });
      alert("Deleted successfully");
      await fetchEvents();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="EventsContainer">
      <div className="HeadWrapper">
        <Link to="/events-calendar" className="calendar-view-button">Calendar</Link>
        <Link to="/events-gallery" className="gallery-button">Photos</Link>
      </div>
      {(auth.user.is_crc || auth.user.is_superuser) && (
        <button onClick={() => setCreatingNew(true)} className="add-new-event">Add Event</button>
      )}
      <div className="CardsWrapper">
      {creatingNew && (
        <Event
          alumni='false'
          title=""
          e_datetime=""
          location=""
          description=""
          image_url={null}
          link={() => handleDetail(event)}
          onSave={(x) => handleCreateNew(x)}
          isNew={true}
          />
        )}
        {auth.user.is_alumni && (
          filteredEvents.map(event => (
            <Event
              key={event.id}
              alumni='true'
              title={event.title}
              e_datetime={event.e_datetime}
              buttonText={event.buttonText}
              link={() => handleDetail(event)}
              timeFunction={(x) => getDateFromDateISOString(x)}
            />
          ))
        )}
        {(auth.user.is_crc || auth.user.is_superuser) && (
          filteredEvents.map(event => (
            <Event
              key={event.id}
              alumni='false'
              title={event.title}
              e_datetime={event.e_datetime}
              location={event.location}
              description={event.description}
              image_url={event.image_url}
              buttonText={event.buttonText}
              link={() => handleDetail(event)}
              onChange={(x) => handleSaveEdit(event.id, x)}
              onDelete={() => handleDelete(event.id)}
              timeFunction={(x) => getDateFromDateISOString(x)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Events;