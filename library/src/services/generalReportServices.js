import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Time Slots
export const fetchStudentsPerGrade = (auth) => {
  return axios.get(`${baseUrl}/students-per-grade/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};



