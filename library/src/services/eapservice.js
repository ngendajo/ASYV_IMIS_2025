import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Grade Time Slots
export const fetchEap = (auth) => {
  return axios.get(`${baseUrl}/eap/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Grade Time Slot
export const createEap = (auth, data) => {
  return axios.post(`${baseUrl}/eap/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Grade Time Slot
export const updateEap = (auth, id, data) => {
  return axios.put(`${baseUrl}/eap/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Delete a Grade Time Slot
export const deleteEap = (auth, id) => {
  return axios.delete(`${baseUrl}/eap/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
