import React, { useEffect, useState } from 'react';
import useAuth from "./hooks/useAuth";
import axios from "axios";
import baseUrl from "./api/baseUrl";
import beepSoundFile from './beeps/beeps.mp3';

// Types
/**
 * @typedef {Object} StudentActivity
 * @property {string} activity
 * @property {string} absenteeism_status
 * @property {string} teacher
 */

/**
 * @typedef {Object} Student
 * @property {string} combination_name
 * @property {string} date
 * @property {string} family_name
 * @property {string} first_name
 * @property {string} gender
 * @property {string} grade_name
 * @property {string} last_name
 * @property {string} studentid
 * @property {StudentActivity[]} activities
 */

// Constants
const NOTIFICATION_TIMES = [
  '08:10', '08:40', '09:00', '09:10', '09:47', 
  '09:30', '10:10', '10:30', '11:10', '13:10', 
  '14:10', '15:10'
];

const WORKING_DAYS = {
  min: 1, // Monday
  max: 5  // Friday
};
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const GRADE_MAPPING = {
  'Intwali': 'S6',
  'Ishami': 'S5',
  'Ijabo': 'S4',
  'default': 'EY'
};

// Helper functions for time and date
const getCurrentTime = () => {
  const now = new Date();
  return {
    day: now.getDay(),
    time: now.toTimeString().slice(0, 5),
    date: now.toISOString().split('T')[0]
  };
};

// Helper functions for name formatting
const formatStudentName = (firstName, lastName) => {
  return `${lastName} ${firstName}`
    .split(' ')
    .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
    .join(' ');
};

// Helper functions for class and grade processing
const getClass = (grade_name, combination_name) => {
  const grade = GRADE_MAPPING[grade_name] || GRADE_MAPPING.default;
  const combMatch = combination_name.match(/\(([^)]+)\)/);
  const comb = combMatch ? combMatch[1].trim() : combination_name;
  return grade === grade_name ? comb : `${grade}_${comb}`;
};

// Data processing functions
const groupData = (data) => {
  const grouped = new Map();

  data.forEach(item => {
    const key = `${item.date}_${item.studentid}_${item.first_name.trim()}_${item.last_name}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        combination_name: item.combination_name,
        date: item.date,
        family_name: item.family_name,
        first_name: item.first_name,
        gender: item.gender === "F" ? "Female" : "Male",
        grade_name: item.grade_name,
        last_name: item.last_name,
        studentid: item.studentid,
        activities: []
      });
    }

    grouped.get(key).activities.push({
      activity: item.activity,
      absenteeism_status: item.absenteeism_status,
      teacher: `${item.teacher_first_name} ${item.teacher_last_name}`
    });
  });

  return Array.from(grouped.values());
};

const separateByAbsenteeismStatus = (data) => {
  return data.reduce((acc, student) => {
    const absentActivities = student.activities.filter(
      activity => activity.absenteeism_status === 'absent'
    );
    
    const lateActivities = student.activities.filter(
      activity => activity.absenteeism_status === 'late'
    );

    if (absentActivities.length > 0) {
      acc.absentData.push({ ...student, activities: absentActivities });
    }

    if (lateActivities.length > 0) {
      acc.lateData.push({ ...student, activities: lateActivities });
    }

    return acc;
  }, { absentData: [], lateData: [] });
};

const groupByStudentId = (data) => {
  return data.reduce((acc, item, index) => {
    const studentId = item.studentid;
    
    if (!acc[studentId]) {
      acc[studentId] = {
        "#": index + 1,
        studentid: studentId,
        name: formatStudentName(item.last_name.trim(), item.first_name.trim()),
        class_name: getClass(item.grade_name, item.combination_name),
        family_name: item.family_name,
        gender: item.gender,
        count: 1
      };
    } else {
      acc[studentId].count++;
    }
    
    return acc;
  }, {});
};

// Main component
const TimeNotification = () => {
  const { auth } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const beepSound = new Audio(beepSoundFile);

  const fetchAbsentStudents = async () => {
    if (!auth?.accessToken) {
      console.warn('No auth token available');
      return [];
    }

    const { date } = getCurrentTime();
    
    try {
      const response = await axios.get(
        `${baseUrl}/attendance-report/?date1=${date}&date2=${date}`,
        {
          headers: {
            "Authorization": `Bearer ${auth.accessToken}`,
            "Content-Type": 'multipart/form-data'
          },
          withCredentials: true 
        }
      );

      const groupedData = groupData(response.data);
      const { absentData } = separateByAbsenteeismStatus(groupedData);
      return Object.values(groupByStudentId(absentData));

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  };

  const showNotification = async () => {
    try {
      const absentStudents = await fetchAbsentStudents();
      const { day, time, date } = getCurrentTime();
      
      if (Notification.permission === 'granted') {
        const message = absentStudents.length > 0
          ? absentStudents.map(student => `${student.name} (${student.studentid})`).join(', ')
          : "Check attendance report";

        new Notification(
          `Attendance Report on ${dayNames[day]} - ${date} at ${time}`, 
          { body: message }
        );
        
        beepSound.play().catch(err => 
          console.warn("Audio playback failed:", err)
        );
        
        setNotificationCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  };

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      }
    };

    const checkNotificationTime = () => {
      const { day, time } = getCurrentTime();
      
      if (day >= WORKING_DAYS.min && 
          day <= WORKING_DAYS.max && 
          NOTIFICATION_TIMES.includes(time)) {
        showNotification();
      }
    };

    requestNotificationPermission();
    const interval = setInterval(checkNotificationTime, 60000);

    return () => clearInterval(interval);
  }, [auth]);

  return (
    <div className="notification-counter">
      {notificationCount > 0 && <span>{notificationCount}</span>}
    </div>
  );
};

export default TimeNotification;