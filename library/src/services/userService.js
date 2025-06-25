import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Users
export const fetchUsers = (auth) => {
  return axios.get(`${baseUrl}/users/`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
