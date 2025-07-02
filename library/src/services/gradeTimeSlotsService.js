import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Grade Time Slots
export const fetchGradeTimeSlots = (auth) => {
  return axios.get(`${baseUrl}/gradetimeslots/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Grade Time Slot
export const createGradeTimeSlot = (auth, data) => {
  return axios.post(`${baseUrl}/gradetimeslots/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Grade Time Slot
export const updateGradeTimeSlot = (auth, id, data) => {
  return axios.put(`${baseUrl}/gradetimeslots/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Delete a Grade Time Slot
export const deleteGradeTimeSlot = (auth, id) => {
  return axios.delete(`${baseUrl}/gradetimeslots/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
