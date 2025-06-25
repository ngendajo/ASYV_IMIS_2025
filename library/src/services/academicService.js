import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Time Slots
export const fetchAcademics = (auth) => {
  return axios.get(`${baseUrl}/academic/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Time Slot
export const createAcademic = (auth, data) => {
  return axios.post(`${baseUrl}/academic/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'application/json'
    },
    withCredentials: true 
  });
};

// Update a Time Slot
export const updateAcademic = (auth, id, data) => {
  return axios.put(`${baseUrl}/academic/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};

// Delete a Time Slot
export const deleteAcademic = (auth, id) => {
  return axios.delete(`${baseUrl}/academic/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};
