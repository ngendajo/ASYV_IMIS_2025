import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { fetchEapClass } from '../../services/eapclassservices';
import { fetchEapAttByClassAndDate, createEapAtt,updateEapAbseStatus,updateEapAtt,deleteEapAttAbsent } from '../../services/eapAttendanceServices';

export default function EapsAtt() {
    const [selectedCombination, setSelectedCombination] = useState(null);
    const [combinations, setCombinations] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const { auth } = useAuth();

    const currentDate = new Date();
    const initialDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const colorPalette = ["#6d5736", "#498160", "#957967", "#d8b040", "#f49c46"];

    const handleCombinationChange = async (combination) => {
        setSelectedCombination(combination);
        
        try {
            if (combination.attendance_id) {
                await getStudentsForSelectedClass(combination.id, selectedDate);
            } else {
                await createEapAtt(auth, {
                    date: selectedDate,
                    staff: auth.user.id,
                    eap_class: combination.id,
                });
                await getStudentsForSelectedClass(combination.id, selectedDate);
            }
        } catch (error) {
            console.error("Error changing combination:", error);
        }
    };

    const getStudentsForSelectedClass = useCallback(
        async (class_id, date) => {
            if (!auth?.accessToken) return;
            try {
                const response = await fetchEapAttByClassAndDate(auth, class_id, date);
                setFilteredStudents(response.data.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        },
        [auth]
    );
    const fetchCombinations = async () => {
        try {
            const response = await fetchEapClass(auth, selectedDate);
            setCombinations(response.data);
        } catch (error) {
            console.error("Error fetching combinations:", error);
        }
    };
    useEffect(() => {
        fetchCombinations();
    }, [auth, selectedDate]);

    const handleDateSelect = async (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        if (selectedCombination) {
            await getStudentsForSelectedClass(selectedCombination.id, newDate);
        }
        fetchCombinations();
    };

    const handleAttendanceChange = async (status, student_id, eapAttendance_id, absenteeism_id) => {
        try {
            if(eapAttendance_id){
                if(status==="present"){
                    if(absenteeism_id){
                        await deleteEapAttAbsent(auth,absenteeism_id)
                    }
                }
                else if(status==="absent" || status==="late"){
                    if(absenteeism_id){
                        await updateEapAbseStatus(auth,{
                            "absenteeism_id": absenteeism_id,
                            "status": status
                        })
                    }else{
                        await updateEapAtt(auth,eapAttendance_id,{
                            "absenteeism": {
                                    "student": student_id,
                                    "status": status
                                }
                            }
                        )
                    }
                }
            }
            // Refresh data after update
            await getStudentsForSelectedClass(selectedCombination.id, selectedDate);
        } catch (error) {
            console.error("Error updating attendance:", error);
        }
    };

    const removeStudents = () => {
        setFilteredStudents([]);
        setSelectedCombination(null);
        fetchCombinations()
    };
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <label htmlFor="date-input">Select Date:</label>
                    <input
                        style={{
                            padding: '5px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            marginBottom: '10px',
                            width: '200px',
                        }}
                        type="date"
                        id="date-input"
                        onChange={handleDateSelect}
                        value={selectedDate}
                    />
                    <h2>Take attendance on {selectedDate}</h2>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px',
                }}
            >
                {filteredStudents.length > 0 ? (
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
                            onClick={removeStudents}
                        >
                            Back
                        </button>
                        <h2>Attendance for Class {selectedCombination.name}</h2>
                        <DynamicTable
                            mockdata={filteredStudents.map(
                                ({ student_id, last_name, first_name, eapabsenteeism_id, eapAttendance_id, school_name, status }, index) => ({
                                    No: index + 1,
                                    Name: `${last_name} ${first_name}`,
                                    School: school_name,
                                    Present: (
                                        <input
                                            type="radio"
                                            name={`attendance-${index}`}
                                            checked={status === "present" || status === null}
                                            onChange={() => handleAttendanceChange("present", student_id,eapAttendance_id, eapabsenteeism_id)}
                                        />
                                    ),
                                    Absent: (
                                        <input
                                            type="radio"
                                            name={`attendance-${index}`}
                                            checked={status === "absent"}
                                            onChange={() => handleAttendanceChange("absent", student_id, eapAttendance_id, eapabsenteeism_id)}
                                        />
                                    ),
                                    Late: (
                                        <input
                                            type="radio"
                                            name={`attendance-${index}`}
                                            checked={status === "late"}
                                            onChange={() => handleAttendanceChange("late", student_id, eapAttendance_id, eapabsenteeism_id)}
                                        />
                                    ),
                                })
                            )}
                        />
                    </div>
                ) : (
                    combinations.map((comb, index) => (
                        <div
                            key={index}
                            onClick={() => handleCombinationChange(comb)}
                            style={{
                                backgroundColor: colorPalette[index % colorPalette.length],
                                color: '#fff',
                                padding: '15px',
                                borderRadius: '8px',
                                width: '200px',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <h2 style={{ margin: '5px 0' }}>Class {comb.name}</h2>
                            <p 
                                style={{ // Cycle through colors
                                color:  comb.attendance_id ? '#498160': "#d8b040",
                                backgroundColor:"#000",
                                padding: '5px',
                                borderRadius: '4px',
                                }}>
                                {comb.attendance_id & comb.absentees_count>0? "Attendance taken showing "+comb.absentees_count+" absence(s)":comb.attendance_id?"Attendance teaken":"Not Yet taken"}
                                </p>
                            
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
