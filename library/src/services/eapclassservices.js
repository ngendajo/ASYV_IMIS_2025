import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Grade Time Slots
export const fetchEapClass = (auth,date) => {
  return axios.get(`${baseUrl}/eap-classes/?date=${date}`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Grade Time Slot
export const createEapClass = (auth, data) => {
  return axios.post(`${baseUrl}/eap-classes/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Grade Time Slot
export const updateEapClass = (auth, id, data) => {
  return axios.put(`${baseUrl}/eap-classes/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Delete a Grade Time Slot
export const deleteEapClass = (auth, id) => {
  return axios.delete(`${baseUrl}/eap-classes/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
