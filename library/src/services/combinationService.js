import axios from 'axios';
import baseUrl from "../api/baseUrl";

export const fetchCombinations = (auth) => {
  return axios.get(`${baseUrl}/combination/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};