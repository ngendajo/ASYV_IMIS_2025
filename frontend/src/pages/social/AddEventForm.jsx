import React, { useState, useEffect } from 'react';
import './AddEventForm.css';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import baseUrl from '../../api/baseUrl';
import MyDropzone from '../contact/MyDropzone';

const AddEventForm = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const currentDate = new Date().toLocaleDateString('en-GB');
    const eventToEdit = location.state?.event;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [e_datetime, setEDatetime] = useState('');
    const [locationName, setLocationName] = useState('');
    const [image, setImage] = useState(null);
    const [activeTab, setActiveTab] = useState('new');
    const [events, setEvents] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [file, setFile] = useState(null);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title);
            setDescription(eventToEdit.description);
            setEDatetime(eventToEdit.e_datetime);
            setLocationName(eventToEdit.location);
            setImage(eventToEdit.image_url);
        }

        // Fetch all events
        axios.get(`${baseUrl}/events/`, {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            }
        })
        .then(res => {
            setEvents(res.data);
        })
        .catch(error => console.log(error));
    }, [eventToEdit, auth.accessToken]);

    const onDrop = (files) => {
        if (files.length > 0) {
            setSelectedFiles(files);
            setFile(URL.createObjectURL(files[0]));
        }
       
      };


    const handleSubmit = (event) => {
        event.preventDefault();
        if (selectedFiles && selectedFiles[0].name){
            var imgname=selectedFiles[0].name
        const file = new File(selectedFiles, imgname);
              setImage({
                image_url:file,
            });
        }else{
            setErrMsg("Select file")
           
        }
        if(!image){
            return;
        }
    

        const eventData = new FormData();
        eventData.append('title', title);
        eventData.append('user', auth.user.id);
        eventData.append('description', description);
        eventData.append('e_datetime', e_datetime);
        eventData.append('location', locationName);
        if (image) {
            eventData.append("image_url", image.image_url);
        }
        const url = eventToEdit ? `${baseUrl}/events/${eventToEdit.id}/` : `${baseUrl}/events/`;
        const method = eventToEdit ? 'put' : 'post';

        console.log(`URL: ${url}`);
        console.log(`Data:`, eventData);

        axios({
            method: method,
            url: url,
            data: eventData,
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'multipart/form-data'
            }
        })
        .then(res => {
            console.log(res);
            alert("Event added successfully!")
            navigate('/events');
        })
        .catch(error => {
            console.log('Error:', error);
            if (error.response) {
                console.log('Response data:', error.response.data);
                console.log('Response status:', error.response.status);
                console.log('Response headers:', error.response.headers);
            }
        });
    };

    return (
        <div className="JobContainer">
            <div className="job-tabs">
                <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>New Event</button>
                <button className={activeTab === 'submitted' ? 'active' : ''} onClick={() => setActiveTab('submitted')}>All Events</button>
            </div>
            <button onClick={() => navigate(-1)} className="event-back-button">Back &gt;</button>
            <div className="job-request-form" style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
                <form onSubmit={handleSubmit}>
                    <div className="job-request-form-grid">
                        <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <input type="datetime-local" placeholder="Date and Time" value={e_datetime} onChange={(e) => setEDatetime(e.target.value)} required />
                        <input type="text" placeholder="Location" value={locationName} onChange={(e) => setLocationName(e.target.value)} required />
                    
    <MyDropzone onDrop={onDrop} multiple={false}>
         
    </MyDropzone>
                    </div>
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                    <div className="submit-container">
                        <button type="submit">Submit Event</button>
                    </div>
                </form>
            </div>

            <div className="submitted-jobs" style={{ display: activeTab === 'submitted' ? 'block' : 'none' }}>
                <h3>All Events</h3>
                <div className="submitted-jobs-list">
                    {events.length === 0 ? <p>No events submitted yet.</p> : events.map(event => (
                        // events.user == auth.user.id ?
                        <div key={event.id} className="event-item">
                            <p>{event.title}</p>
                        </div>
                      //  : null
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddEventForm;