import axios from 'axios';
import baseUrl from "../api/baseUrl";

export const fetchGrades = (auth) => {
  return axios.get(`${baseUrl}/grades/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};