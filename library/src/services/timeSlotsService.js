import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Time Slots
export const fetchTimeSlots = (auth) => {
  return axios.get(`${baseUrl}/timeslots/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Time Slot
export const createTimeSlot = (auth, data) => {
  return axios.post(`${baseUrl}/timeslots/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'application/json'
    },
    withCredentials: true 
  });
};

// Update a Time Slot
export const updateTimeSlot = (auth, id, data) => {
  return axios.put(`${baseUrl}/timeslots/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};

// Delete a Time Slot
export const deleteTimeSlot = (auth, id) => {
  return axios.delete(`${baseUrl}/timeslots/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};
