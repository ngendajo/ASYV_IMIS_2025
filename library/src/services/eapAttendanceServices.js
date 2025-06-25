import axios from 'axios';
import baseUrl from "../api/baseUrl";

// Fetch Student by class and date
export const fetchEapAttByClassAndDate = (auth,class_id,date) => {
  return axios.get(`${baseUrl}/eap-attendance/get_by_class_and_date/?class_id=${class_id}&date=${date}`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
//fetch data by range of date
export const fetchEapAttByRangeOfDate = (auth,startDate,endDate) => {
    return axios.get(`${baseUrl}/eap-attendance/get_by_date_range/?start_date=${startDate}&end_date=${endDate}`, {
      headers: {
        "Authorization": 'Bearer ' + String(auth.accessToken),
        "Content-Type": 'multipart/form-data'
      },
      withCredentials: true 
    });
  };

// Create attendance
export const createEapAtt = (auth, data) => {
  return axios.post(`${baseUrl}/eap-attendance/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};

// Update a Grade Time Slot
export const updateEapAtt = (auth, attendance_id, data) => {
  return axios.post(`${baseUrl}/eap-attendance/${attendance_id}/update_eap_attendance/`, data, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
export const updateEapAbseStatus = (auth, data) => {
    return axios.put(`${baseUrl}/eap-attendance/update_absenteeism_status/`, data, {
      headers: {
        "Authorization": 'Bearer ' + String(auth.accessToken),
        "Content-Type": 'multipart/form-data'
      },
      withCredentials: true 
    });
  };

// Delete a Grade Time Slot
export const deleteEapAttAbsent = (auth, absenteeism_id) => {
  return axios.delete(`${baseUrl}/eap-attendance/delete_absenteeism/?absenteeism_id=${absenteeism_id}`, {
    headers: {
      "Authorization": 'Bearer ' + String(auth.accessToken),
      "Content-Type": 'multipart/form-data'
    },
    withCredentials: true 
  });
};
