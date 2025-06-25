import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from "../../components/dashboard/search-bar";
import { PhotoCard } from "../../components/social/photo-cards"
import './EventsGallery.css';

import axios from 'axios';
import useAuth from "../../hooks/useAuth";


import './Events.css';

// import baseUrl from '../../api/baseUrl';
const  baseUrl='https://backend.asyv.ac.rw/api';

const EventsGallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [creatingNew, setCreatingNew] = useState(false);

  const fetchPhotos = async () =>{
    try {
      const response = await axios.get(baseUrl+'/galleries/',{
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'multipart/form-data'
        },
        withCredentials:true
      });
      setPhotos(response.data);
      console.log(response.data)
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPhotos();
  });

  const photoData = photos;

  // Filter events based on search query
  const filteredPhotos = photoData.filter(photo =>
    photo.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Edit, add, delete
  const handleSaveEdit = async (photoId, photoData) => {
    try {
      await axios.put(baseUrl + "/galleries/" + photoId + "/", photoData,
        {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          }
        }
      ).then(res => {
        console.log(res);
        alert("Posted successfully");
        fetchPhotos();
      }).catch(error => console.log(error.response.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateNew = async (photoData) => {
    if (photoData === null) {
      setCreatingNew(false);
      return;
    }
    try {
      await axios.post(baseUrl + "/galleries/", photoData,
        {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          }
        }
      ).then(res => {
        console.log(res);
        alert("Created successfully");
        fetchPhotos();
        setCreatingNew(false);
      }).catch(error => console.log(error.response.data));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (photoId) => {
    const confirmed = window.confirm('Are you sure you want to delete this album?');
        if (!confirmed) {
            return;
        }
    try {
      await axios.delete(baseUrl + "/galleries/" + photoId + "/", {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'multipart/form-data'
        }
      });
      alert("Deleted successfully");
      await fetchPhotos();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="EventsGalleryContainer">
        <div className="HeadWrapper">
          <button onClick={() => navigate(-1)} className="gallery-button">Back</button>
        </div>
        {(auth.user.is_crc || auth.user.is_superuser) && (
        <button onClick={() => setCreatingNew(true)} className="add-new-event">Add Album</button>
        )}
        <div className="PhotoWrapper">
        {creatingNew && (
          <PhotoCard
            alumni='false'
            image_url={null}
            title=""
            date=""
            link=""
            onSave={(x) => handleCreateNew(x)}
            isNew={true}
          />
        )}
        {auth.user.is_alumni && (
          filteredPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              alumni='true'
              image_url={photo.image_url}
              title={photo.event_name}
              date={photo.createdat}
              link={photo.link}
            />
        )))}
        {(auth.user.is_crc || auth.user.is_superuser) && (
          filteredPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              alumni='false'
              image_url={photo.image_url}
              title={photo.event_name}
              date={photo.createdat}
              link={photo.link}
              onChange={(x) => handleSaveEdit(photo.id, x)}
              onDelete={() => handleDelete(photo.id)}
            />
          ))
        )}
        </div>
    </div>
  );
};

export default EventsGallery;