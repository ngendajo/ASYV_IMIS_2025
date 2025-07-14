import { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../api/baseUrl';
import useAuth from '../hooks/useAuth';

const useProfileData = (userIdOverride) => {
  const { auth } = useAuth();
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);

  const [study, setStudy] = useState([]);
  const [originalStudy, setOriginalStudy] = useState([]);

  const [employment, setEmployment] = useState([]);
  const [originalEmployment, setOriginalEmployment] = useState([]);

  const [dropdownOptions, setDropdownOptions] = useState({
    marital_statuses: [],
    children_options: [],
    levels: [],
    colleges: [],
    combiantions: [],
    grades: [],
    leaps: [],
    families: [],
    industries: [],
    status: [],
    employment_status: [],
    scholarship: [],
  });

  const [editState, setEditState] = useState({
    info: false,
    current: false,
    asyv: false,
    academic: false,
    employment: false
  });

  const userId = userIdOverride || auth.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, dropdownRes] = await Promise.all([
          axios.get(`${baseUrl}/kid/${userId}`, {
            headers: { Authorization: 'Bearer ' + auth.accessToken },
            withCredentials: true
          }),
          axios.get(`${baseUrl}/options/all-dropdowns/`, {
            headers: { Authorization: 'Bearer ' + auth.accessToken },
            withCredentials: true
          }),
        ]);

        setUser(userRes.data);
        setOriginalUser(userRes.data);
        setDropdownOptions(dropdownRes.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    if (userId) fetchData();
  }, [userId, auth]);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const res = await axios.get(`${baseUrl}/alumni-academic/?id=${userId}`, {
          headers: { Authorization: 'Bearer ' + auth.accessToken },
          withCredentials: true,
        });
        const data = res.data.map(item => ({
          id: item.id,
          alumn: item.alumn,
          level: item.level,
          degree: item.degree,
          college: item.college,
          country: item.location,
          scholarship: item.scholarship,
          scholarship_details: item.scholarship_details,
          status: item.status
        }));
        const sorted = sortStudyLevel(data);
        setStudy(sorted);
        setOriginalStudy(sorted);
      } catch (err) {
        console.error('Error fetching academic data:', err);
      }
    };

    if (userId) fetchStudy();
  }, [userId, auth]);

  useEffect(() => {
    const fetchEmployment = async () => {
      try {
        const res = await axios.get(`${baseUrl}/alumni-employment/?id=${userId}`, {
          headers: { Authorization: 'Bearer ' + auth.accessToken },
          withCredentials: true,
        });
        const data = res.data.map(item => ({
          id: item.id,
          alumn: item.alumn,
          title: item.title,
          status: item.status,
          company: item.company,
          industry: item.industry,
          start_date: item.start_date,
          end_date: item.end_date,
          on_going: item.end_date === ""
        }));
        const sorted = sortEmploymentDate(data);
        setEmployment(sorted);
        setOriginalEmployment(sorted);
      } catch (err) {
        console.error('Error fetching employment data:', err);
      }
    };

    if (userId) fetchEmployment();
  }, [userId, auth]);

  const saveKidInfo = async () => {
    try {
      await axios.put(`${baseUrl}/kid/${userId}/`, user, {
        headers: {
          Authorization: 'Bearer ' + auth.accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setOriginalUser(user);
      alert('Kid info saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save Kid info.');
    }
  };

  const saveStudyData = async () => {
    try {
      await axios.put(`${baseUrl}/alumni-academic/?id=${userId}`, {
        academic: study
      }, {
        headers: {
          Authorization: 'Bearer ' + auth.accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setOriginalStudy(study);
      alert('Academic data saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save academic data.');
    }
  };

  const saveEmploymentData = async () => {
    try {
      await axios.put(`${baseUrl}/alumni-employment/?id=${userId}`, {
        employment: employment
      }, {
        headers: {
          Authorization: 'Bearer ' + auth.accessToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setOriginalEmployment(employment);
      alert('Employment data saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save employment data.');
    }
  };

  const sortStudyLevel = (studies) => {
    const levelOrder = { C: 1, A1: 2, A0: 3, M: 4, PHD: 5 };
    return studies.sort((a, b) => {
      const aOrder = levelOrder[a.level] || 99;
      const bOrder = levelOrder[b.level] || 99;
      return aOrder - bOrder || a.degree.localeCompare(b.degree);
    });
  };

  const sortEmploymentDate = (jobs) => {
    return jobs.sort((a, b) => {
      if (!a.end_date) return -1;
      if (!b.end_date) return 1;
      return new Date(b.end_date) - new Date(a.end_date);
    });
  };

  return {
    user, setUser, originalUser,
    study, setStudy, originalStudy,
    employment, setEmployment, originalEmployment,
    dropdownOptions,
    editState, setEditState,
    saveKidInfo, saveStudyData, saveEmploymentData
  };
};

export default useProfileData;
