import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Teacher Combination Grade Subjects
export const fetchTeacherCombinationGradeSubjects = (auth) => {
  return axios.get(`${baseUrl}/teachercombinationgradesubjects/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Create a Teacher Combination Grade Subject
export const createTeacherCombinationGradeSubject = (auth, data) => {
  return axios.post(`${baseUrl}/teachercombinationgradesubjects/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Teacher Combination Grade Subject
export const updateTeacherCombinationGradeSubject = (auth, id, data) => {
  return axios.put(`${baseUrl}/teachercombinationgradesubjects/${id}/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Delete a Teacher Combination Grade Subject
export const deleteTeacherCombinationGradeSubject = (auth, id) => {
  return axios.delete(`${baseUrl}/teachercombinationgradesubjects/${id}/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
