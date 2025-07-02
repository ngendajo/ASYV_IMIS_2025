import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch rooms
export const fetchRooms = (auth) => {
  return axios.get(`${baseUrl}/rooms/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Rooms
export const createRooms = (auth, data) => {
  return axios.post(`${baseUrl}/rooms/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'application/json'
    },
    withCredentials: true 
  });
};

// Update a Rooms
export const updateRooms = (auth, id, data) => {
  return axios.put(`${baseUrl}/rooms/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};

// Delete a Rooms
export const deleteRoom = (auth, id) => {
  return axios.delete(`${baseUrl}/rooms/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};
