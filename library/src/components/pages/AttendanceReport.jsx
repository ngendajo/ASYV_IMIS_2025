import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; // Import custom hook for authentication
import baseUrl from '../../api/baseUrl'; // Import base URL
import { fetchAcademics } from '../../services/academicService';

export default function AttendanceReport() {
    const { auth } = useAuth(); // Retrieve auth object using custom hook
    const currentDate = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const initialDay = dayNames[currentDate.getDay()];
    const initialDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const [selectedday, setSelectedday] = useState(initialDay);
    const [selecteddate, setSelecteddate] = useState(initialDate);
    const [academics, setAcademics] = useState([]);
    const [data, setData] = useState([]);
    const [selectedAcademicId, setSelectedAcademicId] = useState(null);

    function getDateFormat(dat) {
        const selecteddat = (new Date(dat)).toISOString().split('T')[0];
        const selectedda = dayNames[(new Date(dat)).getDay()];
        setSelecteddate(selecteddat);
        setSelectedday(selectedda);
    }

    // Fetch academic years on component mount
    useEffect(() => {
        const loadAcademics = async () => {
            try {
                const response = await fetchAcademics(auth);
                setAcademics(response.data);

                // Set initial selected academic based on current date
                const currentAcademic = response.data.find(academic => {
                    const startDate = new Date(academic.start_date);
                    const endDate = new Date(academic.end_date);
                    return currentDate >= startDate && currentDate <= endDate;
                });
                if (currentAcademic) {
                    setSelectedAcademicId(currentAcademic.id);
                }
            } catch (error) {
                console.error("Error fetching academic years:", error);
            }
        };
        loadAcademics();
    }, [auth]);

    const handleAcademicChange = (event) => {
        setSelectedAcademicId(event.target.value);
    };

    // Define `getAttendances` using useCallback to memoize the function
    const getAttendances = useCallback(async () => {
        if (!auth?.accessToken || !selectedAcademicId) return; // Ensure accessToken and selectedAcademicId exist
        try {
            const response = await axios.get(
                `${baseUrl}/timetable/?academic=${selectedAcademicId}&day_of_week=${selectedday}&dat=${selecteddate}`,
                {
                    headers: {
                        "Authorization": `Bearer ${String(auth.accessToken)}`,
                    },
                    withCredentials: true,
                }
            );

            const groupedData = response.data.reduce((acc, item) => {
                const key = `${item.grade_name} - ${item.combination_name}`;
            
                if (!acc[key]) {
                    acc[key] = {
                        class_name: getClass(item.grade_name, item.combination_name),
                        subjects: []
                    };
                }
            
                acc[key].subjects.push({
                    tcgs_id: item.id,
                    subject_id: item.subject_id,
                    subject_name: item.subject_name,
                    teacher: `${item.teacher_first_name} ${item.teacher_last_name}`,
                    room: item.room_name,
                    activity: item.activity,
                    day_of_week: item.day_of_week,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    attendancetaken_id: item.attendancetaken_id,
                    date: item.dat,
                    absentees: item.absentees
                });
            
                return acc;
            }, {});
            
            // Convert the grouped object back to an array
            let resultArray = Object.values(groupedData);
            
            // Sort by class_name
            resultArray = resultArray.sort((a, b) => {
                if (a.class_name < b.class_name) return -1;
                if (a.class_name > b.class_name) return 1;
                return 0;
            });
            
            setData(resultArray);
            
        } catch (err) {
            console.error("Error fetching attendances:", err);
        }
    }, [auth, selectedAcademicId, selectedday, selecteddate]); // Include dependencies

    useEffect(() => {
        getAttendances();
    }, [getAttendances]); // Call `getAttendances` on component mount and whenever dependencies change

    const getClass = (grade_name, combination_name) => {
        const grade = grade_name === "Intwali" ? "S6" :
                      grade_name === "Ishami" ? "S5" :
                      grade_name === "Ijabo" ? "S4" : "EY";
        const comb = (combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name;
        return grade === "EY" ? comb : grade + "_" + comb;
    };
    // Function to extract the date in YYYY-MM-DD format
    const extractDate = (date) => {
        return new Date(date).toISOString().split('T')[0];
    };
    function toMinutes(hours, minutes) {
        return hours * 60 + minutes;
    }
    function attendanceReportStatus(start_time,end_time,attendancetaken_id,absentees){
        // Create date objects for slot's start and end times
        const startTime = start_time 
        ? (() => {
            const [hours, minutes] = start_time.split(':');
            return { hours: parseInt(hours), minutes: parseInt(minutes) };
            })() 
        : null;
        const slotStartTime = startTime ? `${startTime.hours}:${startTime.minutes}`:"N/A"

        const endTime = end_time 
        ? (() => {
            const [hours, minutes] = end_time.split(':');
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
        let action = '';
        // Extract the date from selecteddate for comparison
        const slotDateString = extractDate(selecteddate);

        if (attendancetaken_id) {
            const absentCount = absentees.filter(item => item.status === "absent").length;
            const lateCount = absentees.filter(item => item.status === "late").length;
                attendanceStatus = absentCount>0 && lateCount>0 ? `Attendance taken showing ${absentCount} absence(s) and ${lateCount} Lateness`:absentCount>0?`Attendance taken showing ${absentCount} absence(s)`:lateCount>0?`Attendance taken with ${lateCount} Lateness`:"Attendance taken";
                action="taken"
        } else if (
            initialDate === slotDateString && // Compare only the date portion
            slotStartTime && slotEndTime && currentTime &&
            currentTotalMinutes >= slotStartTotalMinutes &&
            currentTotalMinutes <= slotEndTotalMinutes
        ) {
            attendanceStatus = 'Take attendance';
            
            action="take"
        } else if (
            initialDate === slotDateString &&
            currentTotalMinutes > slotEndTotalMinutes
        ) {
            attendanceStatus = 'Not taken';
            action="take"
        } else if (
            initialDate === slotDateString &&
            currentTotalMinutes < slotStartTotalMinutes
        ) {
            attendanceStatus = 'Waiting';
            action="wait"
        } else if (
            new Date(selecteddate).toISOString().split('T')[0] < initialDate // Compare slot date to current date
        ) {
            attendanceStatus = 'Not taken on '+selecteddate;
            action="take"
        } else {
            attendanceStatus = 'Waiting';
            action="wait"
        }
        return [attendanceStatus,action]
    }
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <h2>
                Attendance Report
                <select 
                    value={selectedAcademicId || ''}
                    onChange={handleAcademicChange}
                    style={{
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        color: '#498160',
                        border: 'none',
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
            </h2>
            <h2>Day: {selectedday}<br/>Date: {selecteddate}</h2>
            <input
                type="date"
                style={{
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    width: '200px',
                }}
                value={selecteddate}
                onChange={(e) => getDateFormat(e.target.value)}
            />
            <div>
                {data.length > 0 ? data.map((slot, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            fontWeight: 'bold',
                            gap: '10px',
                            borderBottom: '5px solid #ccc',
                            padding: '5px'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>{index + 1}.</div>
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>{slot.class_name}</div>
                        
                        {slot.subjects.length > 0 && slot.subjects.map((sbj, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', // Center items within the subject card
                                    textAlign: 'center',   // Center text inside the subject card
                                    gap: '5px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: i % 2 === 0 ? '#d8b040' : '#f49c46'
                                }}
                            >
                                <h3 style={{ color: '#498160', margin: '4px 0' }}>{sbj.subject_name}</h3>
                                <h3 style={{ color: '#957967', margin: '4px 0' }}>{sbj.teacher}</h3>
                                <p style={{ fontSize: '14px', color: '#6d5736', margin: '2px 0' }}>
                                    {sbj.activity}: {sbj.start_time} - {sbj.end_time}
                                </p>
                                <p style={{ fontSize: '14px', color: '#6d5736', margin: '2px 0' }}>
                                    {sbj.room}
                                </p>
                                <p style={{ fontStyle: 'italic', color:attendanceReportStatus(sbj.start_time,sbj.end_time,sbj.attendancetaken_id,sbj.absentees)[1]='wait'?'#000':attendanceReportStatus(sbj.start_time,sbj.end_time,sbj.attendancetaken_id,sbj.absentees)[1]='take'?'F09319':'#498160', margin: '2px 0' }}>
                                    {attendanceReportStatus(sbj.start_time,sbj.end_time,sbj.attendancetaken_id,sbj.absentees)[0]}
                                </p>
                            </div>
                        ))}
                </div>
                
                
                )) : <p>No Data</p>}
            </div>
        </div>
    );
}
