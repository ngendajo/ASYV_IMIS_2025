import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Grade Time Slots
export const fetchSchools = (auth) => {
  return axios.get(`${baseUrl}/schools/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Grade Time Slot
export const createSchools = (auth, data) => {
  return axios.post(`${baseUrl}/schools/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Grade Time Slot
export const updateSchools = (auth, id, data) => {
  return axios.put(`${baseUrl}/schools/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Delete a Grade Time Slot
export const deleteSchools = (auth, id) => {
  return axios.delete(`${baseUrl}/schools/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
