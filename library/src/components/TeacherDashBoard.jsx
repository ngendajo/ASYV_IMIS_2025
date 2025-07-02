import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import baseUrl from "../api/baseUrl";
import useAuth from "../hooks/useAuth";
import { fetchAcademics } from '../services/academicService';
import DynamicTable from "../components/pages/dinamicTable/DynamicTable";

export default function TeacherDashBoard() {
  const { auth } = useAuth();
  const [data, setData] = useState([]);
  const workingdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDate = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const initialDay = dayNames[currentDate.getDay()];
  const initialDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  const [selectedday, setSelectedday] = useState(initialDay);
  const [selecteddate, setSelecteddate] = useState(initialDate);

  const [selectedclass, setSelectedclass] = useState("");
  const [academics, setAcademics] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAcademicId, setSelectedAcademicId] = useState(null);
  const colorPalette = ["#6d5736", "#498160", "#957967", "#d8b040", "#f49c46"];

  const handleAcademicChange = (event) => {
    setSelectedAcademicId(event.target.value);
    getStudents();
  };

  const getClass = (grade_name, combination_name) => {
    const grade = grade_name === "Intwali" ? "S6" :
                  grade_name === "Ishami" ? "S5" :
                  grade_name === "Ijabo" ? "S4" : "EY";
    const comb = (combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name;
    return grade === grade_name ? comb : grade + "_" + comb;
  };

  const handleDayChange = (event) => {
    const dayName = event.target.value;
    setSelectedday(dayName);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const selectedDayIndex = daysOfWeek.indexOf(dayName);

    // Calculate the date of the selected day
    const selectedDayDate = new Date(currentDate);
    selectedDayDate.setDate(currentDate.getDate() - currentDayOfWeek + selectedDayIndex);
    // Format the date as YYYY-MM-DD
    const formattedDate = selectedDayDate.toISOString().slice(0, 10);

    setSelecteddate(formattedDate);
    //console.log(formattedDate)
  };

  const getStudents = useCallback(async () => {
    if (!auth?.accessToken) return;
    try {
      const response = await axios.get(`${baseUrl}/timetable/?academic=${selectedAcademicId}&day_of_week=${selectedday}&teacher=${auth.user.id}&dat=${selecteddate}`, {
        headers: {
          "Authorization": `Bearer ${String(auth.accessToken)}`,
        },
        withCredentials: true,
      });
      setData(response.data);
      console.log(`${baseUrl}/timetable/?academic=${selectedAcademicId}&day_of_week=${selectedday}&teacher=${auth.user.id}&dat=${selecteddate}`)
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [auth, selectedAcademicId, selectedday]);

  useEffect(() => {
    
    // Fetch academic years and set the default academic year based on today's date
    fetchAcademics(auth).then(response => {
      const academicYears = response.data;
      setAcademics(academicYears);
  
      const todayDate = new Date();
      const currentAcademic = academicYears.find(academic => {
        const startDate = new Date(academic.start_date);
        const endDate = new Date(academic.end_date);
        return todayDate >= startDate && todayDate <= endDate;
      });
  
      if (currentAcademic) {
        setSelectedAcademicId(currentAcademic.id);
      }
    });
  }, [auth]);
  
  // Fetch students whenever selected day or academic year changes
  useEffect(() => {
    if (selectedday && selectedAcademicId) {
      getStudents();
    }
  }, [selectedday, selectedAcademicId, getStudents]);

  const getClassStudents = async (tcgs) => {
    if (!auth?.accessToken) return; // Ensure accessToken exists
    try {
        const response = await axios.get(`${baseUrl}/students/by-tcgs/${tcgs}/?date=${selecteddate}`, {
            headers: {
                "Authorization": `Bearer ${String(auth.accessToken)}`,
            },
            withCredentials: true,
        });
        const attendanceId = response.data.attendance?.id || null;
        //console.log(`${baseUrl}/students/by-tcgs/${tcgs}/?date=${selecteddate}`)
        return response.data.students.map(student => ({
          "Last Name": student.student_user_last_name.trim(), // Remove any extra spaces
          "First Name": student.student_user_first_name.trim(),
          "Reg.No": student.student_studentid,
          "st_id": student.student_id,
          "tcgs": tcgs,
          "attendanceId": attendanceId, // Assuming attendance is an object
          "absenteeism_id":student.absenteeism? student.absenteeism.id:null,
          "absenteeism_status":student.absenteeism? student.absenteeism.status:null
      }));
        
    } catch (err) {
        console.error(err);
        // navigate('/error');
    }
};

const handleSlotClick = async (slot_id,action,class_name) => {
    setSelectedclass(class_name)
    try {
        if (action === "take") {
            await axios.post(baseUrl + '/attendance/', {
                'teachercombinationgradesubject': slot_id,
                'date': selecteddate
            }, {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'application/json'
                }
            });
            
            // Await the students data
            const studentsData = await getClassStudents(slot_id);
            setStudents(studentsData);
            getStudents();
            
        } else if (action === "update") {
            // Await the students data
            const studentsData = await getClassStudents(slot_id);
            setStudents(studentsData);
        }

    } catch (error) {
        console.log(error.response?.data);
    }
};

  //console.log(data)
  // Function to extract the date in YYYY-MM-DD format
  const extractDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };
  function toMinutes(hours, minutes) {
      return hours * 60 + minutes;
  }
  function removestudent(){
    setStudents([])
    setSelectedclass("")
  }
  //console.log(data)
  //console.log(students)
  const handleAttendanceChange = async (status, attendanceId, st_id, tcgs, absenteeism_id) => {
    // Perform the necessary logic, e.g., API call, updating state, etc.
    //console.log(`Status: ${status}`, attendanceId, st_id, tcgs, absenteeism_id);
    
    try {
        if (absenteeism_id === null) {
            // Make API call to add absenteeism
            await axios.post(`${baseUrl}/attendance/${attendanceId}/update_absenteeism/`, {
              "absenteeism": {
                "student": st_id,
                "status": status
            }
            }, {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'application/json'
                }
            });
            
            // Fetch updated students data
            const studentsData = await getClassStudents(tcgs);
            setStudents(studentsData);
            
            // Call getStudents if it's intended to refresh or re-fetch data
            getStudents();
        }else if(status==="present"){
          // Make API call to add absenteeism
          await axios.post(`${baseUrl}/attendance/${attendanceId}/delete_absenteeism/`, {
            "absenteeism_id": absenteeism_id
          }, {
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'application/json'
              }
          });
          
          // Fetch updated students data
          const studentsData = await getClassStudents(tcgs);
          setStudents(studentsData);
          
          // Call getStudents if it's intended to refresh or re-fetch data
          getStudents();
        }else {
          // Make API call to add absenteeism
          await axios.post(`${baseUrl}/absenteeism/${absenteeism_id}/update_status/`, {
            "status": status
          }, {
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'application/json'
              }
          });
          
          // Fetch updated students data
          const studentsData = await getClassStudents(tcgs);
          setStudents(studentsData);
          
          // Call getStudents if it's intended to refresh or re-fetch data
          getStudents();
        }

    } catch (error) {
        console.error("Error updating attendance:", error.response?.data || error.message);
    }
};

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
        margin: '20px 0'
      }}
    >
      <h2>Welcome {auth.user.first_name} {auth.user.last_name}</h2>
      <h1>
        Your Timetable On
        <select 
          value={selectedday || ''}
          onChange={handleDayChange}
          style={{
            fontSize: '0.8em',
            fontWeight: 'bold',
            color: '#498160',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            backgroundColor: 'transparent',
            marginLeft: '10px',
            padding: '5px 1px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>select day</option>
          {workingdays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <select 
          value={selectedAcademicId || ''}
          onChange={handleAcademicChange}
          style={{
            fontSize: '0.8em',
            fontWeight: 'bold',
            color: '#498160',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            backgroundColor: 'transparent',
            marginLeft: '10px',
            padding: '5px 1px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>Academic Year</option>
          {academics.map((academic) => (
            <option key={academic.id} value={academic.id}>
              {`${new Date(academic.start_date).getFullYear()}/${new Date(academic.end_date).getFullYear()}`}
            </option>
          ))}
        </select>
      </h1>
      <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',          // Allow items to wrap
            justifyContent: 'center',  // Center the items
            gap: '10px',               // Add spacing between items
            padding: '20px',
          }}
        >
          {students.length>0?
            <div>
                <button
                    style={{ 
                      padding: '10px 20px',
                      margin: '5px',
                      border: 'none',
                      borderRadius: '5px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '16px',
                      backgroundColor: '#002F6C',
                     }}
                    onClick={removestudent}  // Call filterToday on button click
                >
                    Back
                </button>
              <h2>Do attendance for {selectedclass}</h2>
              <DynamicTable 
                  mockdata={students.map(({ attendanceId, absenteeism_id, absenteeism_status,st_id,tcgs, ...rest }, index) => ({
                      No: index + 1, // Adding numbering
                      ...rest,
                      Present: (
                          <input 
                              type="radio" 
                              name={`attendance-${index}`} 
                              checked={absenteeism_status === null}
                              onChange={() => handleAttendanceChange("present", attendanceId,st_id,tcgs, absenteeism_id)} 
                          />
                      ),
                      Absent: (
                          <input 
                              type="radio" 
                              name={`attendance-${index}`} 
                              checked={absenteeism_status === "absent"}
                              onChange={() => handleAttendanceChange("absent", attendanceId,st_id,tcgs, absenteeism_id)} 
                          />
                      ),
                      Late: (
                          <input 
                              type="radio" 
                              name={`attendance-${index}`} 
                              checked={absenteeism_status === "late"}
                              onChange={() => handleAttendanceChange("late", attendanceId,st_id,tcgs, absenteeism_id)} 
                          />
                      ),
                  }))} 
              />
            </div>:
            data.map((slot, index) => {
              // Parse times for comparison
              // Assuming selecteddate is in YYYY-MM-DD format and slot.start_time, slot.end_time are in HH:MM format
                  // Get the current date string in YYYY-MM-DD format
                  //const currentDate = new Date();
                  const currentDateString = currentDate.toISOString().split('T')[0];
      
                  // Create date objects for slot's start and end times
                  const startTime = slot.start_time 
                    ? (() => {
                        const [hours, minutes] = slot.start_time.split(':');
                        return { hours: parseInt(hours), minutes: parseInt(minutes) };
                      })() 
                    : null;
                  const slotStartTime = startTime ? `${startTime.hours}:${startTime.minutes}`:"N/A"
      
                  const endTime = slot.end_time 
                    ? (() => {
                        const [hours, minutes] = slot.end_time.split(':');
                        return { hours: parseInt(hours), minutes: parseInt(minutes) };
                      })() 
                    : null;
                  const slotEndTime = endTime ? `${endTime.hours}:${endTime.minutes}` : 'N/A'
                  // Create a current time object based on current hours and minutes
                  const currentHours = currentDate.getHours();
                  const currentMinutes = currentDate.getMinutes();
      
                  // Format the current time as a string
                  const currentTime = `${currentHours}:${currentMinutes}`;
                  const currentTotalMinutes = toMinutes(currentHours, currentMinutes);
                  const slotEndTotalMinutes = toMinutes(endTime.hours, endTime.minutes);
                  const slotStartTotalMinutes = toMinutes(startTime.hours, startTime.minutes);
      
                  // Get attendance status message and color
                  let attendanceStatus = '';
                  let action=''
      
                  // Extract the date from selecteddate for comparison
                  const slotDateString = extractDate(selecteddate);
      
                  if (slot.attendancetaken_id) {
                    action="update"
                    const absentCount = slot.absentees.filter(item => item.status === "absent").length;
                    const lateCount = slot.absentees.filter(item => item.status === "late").length;
                      attendanceStatus = absentCount>0 && lateCount>0 ? `Attendance taken showing ${absentCount} absence(s) and ${lateCount} Lateness`:absentCount>0?`Attendance taken showing ${absentCount} absence(s)`:lateCount>0?`Attendance taken with ${lateCount} Lateness`:"Attendance taken";
                  } else if (
                      currentDateString === slotDateString && // Compare only the date portion
                      slotStartTime && slotEndTime && currentTime &&
                      currentTotalMinutes >= slotStartTotalMinutes &&
                      currentTotalMinutes <= slotEndTotalMinutes
                  ) {
                      attendanceStatus = 'Take attendance';
                      
                      action="take"
                  } else if (
                      currentDateString === slotDateString &&
                      currentTotalMinutes > slotEndTotalMinutes
                  ) {
                      attendanceStatus = 'Not taken';
                      
                      action="take"
                  } else if (
                      currentDateString === slotDateString &&
                      currentTotalMinutes < slotStartTotalMinutes
                  ) {
                      attendanceStatus = 'Wait';
                      
                      action="wait"
                  } else if (
                      new Date(selecteddate).toISOString().split('T')[0] < currentDateString // Compare slot date to current date
                  ) {
                      attendanceStatus = 'Not taken on '+selecteddate;
                      
                      action="take"
                  } else {
                      attendanceStatus = 'Wait';
                      
                      action="wait"
                  }
      
                  // Use the attendanceStatus variables as needed
      
      
              return (
                <div
                key={slot.id}
                onClick={() => action !== "wait" && handleSlotClick(slot.id, action,getClass(slot.grade_name, slot.combination_name))} // Prevent click if action is "wait"
                style={{
                    backgroundColor: colorPalette[index % colorPalette.length],  // Cycle through colors
                    color: action === "wait" ? '#000' : '#fff', // Change text color to gray when "wait"
                    padding: '15px',
                    borderRadius: '8px',
                    width: '200px',                    // Fixed width for items
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',           // Stack contents vertically
                    alignItems: 'center',              // Center-align content
                    textAlign: 'center',
                    cursor: action === "wait" ? "not-allowed" : "pointer", // Change cursor style based on action
                }}
                >
                  <h2 style={{ margin: '5px 0' }}>{getClass(slot.grade_name, slot.combination_name)}</h2>
                  <p style={{ margin: '5px 0' }}>{slot.subject_name}</p>
                  <p style={{ margin: '5px 0' }}>{slot.room_name}</p>
                  <p style={{ margin: '5px 0' }}>{slot.activity}: {slot.start_time} - {slot.end_time}</p>
                  {attendanceStatus && (
                    <p 
                    style={{ // Cycle through colors
                      color: action === "wait" ? '#498160': "#d8b040",
                      backgroundColor:"#000",
                      padding: '5px',
                    borderRadius: '4px',
                    }}>
                      {attendanceStatus}
                    </p>
                  )}
                </div>
              );
            })
          }
          
        </div>
    </div>
  );
}