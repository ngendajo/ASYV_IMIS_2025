import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Subjects
export const fetchSubjects = (auth) => {
  return axios.get(`${baseUrl}/subjects/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Subject
export const createSubject = (auth, data) => {
  return axios.post(`${baseUrl}/subjects/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'application/json'
    },
    withCredentials: true 
  });
};

// Update a Subject
export const updateSubject = (auth, id, data) => {
  return axios.put(`${baseUrl}/subjects/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};

// Delete a Subject
export const deleteSubject = (auth, id) => {
  return axios.delete(`${baseUrl}/subjects/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true
  });
};
