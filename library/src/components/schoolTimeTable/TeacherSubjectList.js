import React, { useState, useEffect } from 'react';
import { fetchTeacherCombinationGradeSubjects,createTeacherCombinationGradeSubject,updateTeacherCombinationGradeSubject, deleteTeacherCombinationGradeSubject } from '../../services/teacherSubjectService';
import { fetchGradeTimeSlots } from '../../services/gradeTimeSlotsService';
import { fetchTimeSlots } from '../../services/timeSlotsService';
import { fetchAcademics} from '../../services/academicService';
import { fetchSubjects } from '../../services/subjectService';
import { fetchUsers } from '../../services/userService';
import { fetchRooms} from '../../services/roomServices';

import useAuth from "../../hooks/useAuth";

import axios from "axios";
import baseUrl from "../../api/baseUrl";

const TeacherSubjectList = () => {
    let { auth } = useAuth();
    const [academics, setAcademics] = useState([]);
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [edit, setEdit] = useState([]);
    const [data, setData] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedAcademicId, setSelectedAcademicId] = useState(null); // State to hold the selected academic year ID
    const [formData, setFormData] = useState({
        combination: '',
        gradetimeslots: '',
        room:'',
        teacher: '',
        subject: '',
        academic: ''
    });
    const [isModalOpen, setModalOpen] = useState(false);

  // State for managing form data
  const [formupdateData, setformupdateData] = useState([]);

  // Handle changes in the form fields
  const handleupdateChange = (e) => {
    const { name, value } = e.target;
    setformupdateData({ ...formupdateData, [name]: value });
  };

  // Handle form submission
  const handleupdateSubmit = () => {
    console.log(formupdateData); // Pass form data to the parent component
    updateTeacherCombinationGradeSubject(auth,formupdateData.id,formupdateData)
            .then(response => {
                
                //console.log('Updated successfully', response.data);
                // handle success (e.g., redirect, show message)
                // Update the teacherSubjects state with the new data
                setTeacherSubjects(prevSubjects =>
                    prevSubjects.map(subject =>
                        subject.id === response.data.id ? response.data : subject
                    )
                );
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    setModalOpen(false); // Close the modal after submission
  };
  
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value, 10) });
    };
    const changeFormData = (comb,gts,ac) => {
        setFormData({ ...formData,combination:comb, gradetimeslots: gts,academic:ac });
        setEdit([comb,gts,ac])
    };
    
    const handleSubmit = () => {
        
        createTeacherCombinationGradeSubject(auth,formData)
            .then(response => {
                setEdit([])
                fetchTeacherCombinationGradeSubjects(auth).then(response => setTeacherSubjects(response.data));
                console.log('Created successfully', response.data);
                // handle success (e.g., redirect, show message)
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };
    useEffect(() => {
        fetchAcademics(auth).then(response => {
            const academicYears = response.data;
            setAcademics(academicYears);

            // Set the default selected academic year based on today's date
            const today = new Date();

            // Check if today's date falls within any of the academic year ranges
            const currentAcademic = academicYears.find(academic => {
                const startDate = new Date(academic.start_date);
                const endDate = new Date(academic.end_date);
                return today >= startDate && today <= endDate; // Check if today is within the range
            });

            if (currentAcademic) {
                setSelectedAcademicId(currentAcademic.id); // Set the selected academic ID to the current academic year
            }
        });
    }, [auth]);

    const handleAcademicChange = (event) => {
        setSelectedAcademicId(event.target.value); // Update the selected academic ID
    };

    useEffect(() => {
        fetchAcademics(auth).then(response => setAcademics(response.data));
        fetchSubjects(auth).then(response => setSubjects(response.data));
        fetchUsers(auth).then(response => setTeachers(response.data.filter(user => user.is_teacher || user.is_librarian)));
        fetchRooms(auth).then(response => setRooms(response.data));
    }, [auth]);
    useEffect(() =>{
        const getData = async () => {
            try {
                // Fetch student data
                const response = await axios.get(`${baseUrl}/students/`, {
                    headers: {
                        "Authorization": `Bearer ${String(auth.accessToken)}`,
                    },
                    withCredentials: true,
                });
        
                // Group grades with their unique combinations
                const groupedGrades = response.data.reduce((result, item) => {
                    const { grade_id, grade_name, combination_id, combination_name } = item;
        
                    if (!result[grade_id]) {
                        result[grade_id] = {
                            grade_id,
                            grade_name: grade_name === "Intwali" ? "S6" : 
                                        grade_name === "Ishami" ? "S5" : 
                                        grade_name === "Ijabo" ? "S4" : 
                                        "EY",
                            combinations: []
                        };
                    }
        
                    const isCombinationExists = result[grade_id].combinations.some(
                        combo => combo.combination_id === combination_id
                    );
        
                    if (!isCombinationExists) {
                        result[grade_id].combinations.push({
                            combination_id,
                            combination_name: (combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name
                        });
                    }
        
                    return result;
                }, {});
        
                const uniqueGradeCombinations = Object.values(groupedGrades);
        
                uniqueGradeCombinations.sort((a, b) => {
                    if (a.grade_name < b.grade_name) return -1;
                    if (a.grade_name > b.grade_name) return 1;
                    return 0;
                });
        
                const gradeTimeSlotsResponse = await fetchGradeTimeSlots(auth);
                const gradetimeslots = gradeTimeSlotsResponse.data;
        
                const timeSlotsResponse = await fetchTimeSlots(auth);
                const timeslots = timeSlotsResponse.data;
        
                uniqueGradeCombinations.forEach(gradeCombination => {
                    const matchingSlots = gradetimeslots.filter(slot => slot.grade === gradeCombination.grade_id)
                        .map(({ grade, ...rest }) => rest);
        
                    gradeCombination.gradetimeslots = [];
        
                    matchingSlots.forEach(slot => {
                        const matchingTimeslot = timeslots.find(ts => ts.id === slot.timeslots);
                        if (matchingTimeslot) {
                            slot.timeslotDetails = matchingTimeslot;
                        }
        
                        // Remove `day_of_week` from slot before adding to dayEntry.slot
                        const { day_of_week, ...slotWithoutDayOfWeek } = slot;
        
                        // Find or create the day entry in gradetimeslots
                        let dayEntry = gradeCombination.gradetimeslots.find(day => day.day_of_week === day_of_week);
                        if (!dayEntry) {
                            dayEntry = { day_of_week, slot: [] };
                            gradeCombination.gradetimeslots.push(dayEntry);
                        }
        
                        // Add the slot without `day_of_week` to the day's slot array
                        dayEntry.slot.push(slotWithoutDayOfWeek);
                    });
        
                    gradeCombination.gradetimeslots.forEach(day => {
                        // Sort each day's slots by start_time using Date objects
                        day.slot.sort((a, b) => {
                            const timeA = new Date(`1970-01-01T${a.timeslotDetails.start_time}Z`);
                            const timeB = new Date(`1970-01-01T${b.timeslotDetails.start_time}Z`);
                            return timeA - timeB;
                        });
                    });
        
                    // Sort gradetimeslots by day_of_week
                    const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                    gradeCombination.gradetimeslots.sort((a, b) => dayOrder[a.day_of_week] - dayOrder[b.day_of_week]);
                });
        
                setData(uniqueGradeCombinations);
                console.log(uniqueGradeCombinations);
        
            } catch (err) {
                console.error(err);
                // navigate('/error');
            }
        };
        
        getData();
    
    },[auth])
    //console.log("data",data)

    useEffect(() => {
        fetchTeacherCombinationGradeSubjects(auth).then(response => setTeacherSubjects(response.data));
    }, [auth]);

    const handleUpdate = (data) =>{
        setformupdateData(data)
        setModalOpen(true)
    }
    
    const handleDelete = (id) => {
        deleteTeacherCombinationGradeSubject(auth, id)
            .then(() => {
                setTeacherSubjects(teacherSubjects.filter(item => item.id !== id));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const centeredContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      };
      const styles = {
        form: {
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          width: '150px',
          margin: 'auto',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        select: {
          padding: '3px',
          fontSize: '10px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        },
        buttonContainer: {
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
        },
        submitButton: {
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '3px 3px',
          fontSize: '10px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        cancelButton: {
          backgroundColor: '#f44336',
          color: 'white',
          padding: '3px 3px',
          fontSize: '10px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        updateEventButton: {
            backgroundColor: '#498160',
            color: 'white',
            padding: '3px 3px',
            fontSize: '10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
          },
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          },
          modal: {
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            width: "400px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
      };
      const formatTime = (time) => {
            // Extract hours and minutes from the time string
            const [hours, minutes] = time.split(':').slice(0, 2); // Get first two parts (HH and mm)
            return `${hours}:${minutes}`;
        };
      //console.log("content",teacherSubjects)
    return (
        <div style={centeredContainerStyle}>
            <h1>
                General School Timetable 
                <select 
                    value={selectedAcademicId || ''}
                    onChange={handleAcademicChange}
                    style={{
                        fontSize: '0.8em',        // Match font size with the heading
                        fontWeight: 'bold',       // Match font weight with the heading
                        color: '#498160',           // Match font color with the heading
                        borderTop: 'none',        // No top border
                        borderLeft: 'none',       // No left border
                        borderRight: 'none',      // No right border
                        borderBottom: 'none', // Green underline style
                        backgroundColor: 'transparent',  // Transparent background
                        marginLeft: '10px',       // Spacing to align with heading
                        padding: '5px 1px',      // Padding for better spacing
                        outline: 'none',          // Remove focus outline
                        cursor: 'pointer'         // Change cursor to pointer on hover
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
            
            {data.map(grade => (
                <span key={grade.grade_id}>
                    <h2>{grade.grade_name} SCHEDULE</h2>
                        {grade.gradetimeslots.map(gradetimeslot =>(
                            <table key={gradetimeslot.day_of_week} className="styled-table">
                                <thead>
                                    <tr>
                                        <th colSpan="2">{gradetimeslot.day_of_week}</th>
                                        {grade.combinations.map(comb =>(
                                            <th key={comb.combination_id}>{grade.grade_name==="EY"?null:grade.grade_name+"_"}{comb.combination_name}</th>
                                        ))}
                                        
                                    </tr>
                                </thead>
                                {gradetimeslot.slot.map(sl=>(
                                  <tbody key={sl.id}>
                                    <tr>
                                        <td>{sl.activity}</td>
                                        <td>{`${formatTime(sl.timeslotDetails.start_time)}-${formatTime(sl.timeslotDetails.end_time)}`}</td>
                                        {grade.combinations.map(comb =>(
                                            <td 
                                                key={comb.combination_id} 
                                                style={{
                                                    backgroundColor: ["BREAKFAST","ACADEMIC ADVISORY","LIFE SKILLS","CRC Workshop","WEEKLY EXAM","PROJECT","FAMILY TIME","EP SPORTS", "CLEANING CLASSES","PROJECT 1","PROJECT 2", "ILEAD", "ASSEMBLY", "BREAK", "LUNCH", "CLUBS", "PERSONAL TIME", "DINNER", "EVENING STAR", "WELLNESS SESSION", "CRC WORKSHOP", "EP- ART CENTER", "COMPUTER HOUR", "LEAP PRACTICE", "HOMEROOM MEETING", "EP- SCIENCE CENTER/ART CENTER", "MUCAKA MUCAKA"]
                                                        .includes(sl.activity)
                                                        ? "black"
                                                        : "transparent"
                                                }}
                                            >
                                                {["BREAKFAST", "CLEANING CLASSES","ACADEMIC ADVISORY","LIFE SKILLS","ILEAD","FAMILY TIME","EP SPORTS","PROJECT 1","PROJECT 2","CRC Workshop","WEEKLY EXAM","PROJECT", "ASSEMBLY", "BREAK", "LUNCH", "CLUBS", "PERSONAL TIME", "DINNER", "EVENING STAR", "WELLNESS SESSION", "CRC WORKSHOP", "EP- ART CENTER", "COMPUTER HOUR", "LEAP PRACTICE", "HOMEROOM MEETING", "EP- SCIENCE CENTER/ART CENTER", "MUCAKA MUCAKA"]
                                                .includes(sl.activity)
                                                ? null
                                                :
                                                edit[0]===comb.combination_id && edit[1]===sl.id && edit[2]===selectedAcademicId ?
                                                    <form style={styles.form}>
                                                        <select name="subject" onChange={handleChange} style={styles.select}>
                                                        <option value="">Select Subject</option>
                                                        {subjects.map((subject) => (
                                                            <option key={subject.id} value={subject.id}>
                                                            {subject.subject_name}
                                                            </option>
                                                        ))}
                                                        </select>
                                                
                                                        <select name="teacher" onChange={handleChange} style={styles.select}>
                                                        <option value="">Select Teacher</option>
                                                        {teachers.map((teacher) => (
                                                            <option key={teacher.id} value={teacher.id}>
                                                            {teacher.first_name} {teacher.last_name}
                                                            </option>
                                                        ))}
                                                        </select>
                                                
                                                        <select name="room" onChange={handleChange} style={styles.select}>
                                                        <option value="">Select Room</option>
                                                        {rooms.map((room) => (
                                                            <option key={room.id} value={room.id}>
                                                            {room.room_name}
                                                            </option>
                                                        ))}
                                                        </select>
                                                
                                                        <div style={styles.buttonContainer}>
                                                        <span onClick={handleSubmit} style={styles.submitButton}>
                                                            Submit
                                                        </span>
                                                        <span onClick={() => setEdit([])} style={styles.cancelButton}>
                                                            Cancel
                                                        </span>
                                                        </div>
                                                    </form>
                                                    :
                                                    <>
                                                        {teacherSubjects.length > 0 &&
                                                            teacherSubjects
                                                                .filter(
                                                                    (teacherSubject) =>
                                                                        teacherSubject.combination === comb.combination_id &&
                                                                        teacherSubject.gradetimeslots === sl.id &&
                                                                        teacherSubject.academic === selectedAcademicId
                                                                )
                                                                .map((teacherSubject, index) => (
                                                                    <p key={index}>
                                                                        {teacherSubject.subject_name}
                                                                        <br />
                                                                        {teacherSubject.teacher_last_name}
                                                                        <br />
                                                                        {teacherSubject.room_name}
                                                                    </p>
                                                                )).length > 0 ? (
                                                                    teacherSubjects
                                                                        .filter(
                                                                            (teacherSubject) =>
                                                                                teacherSubject.combination === comb.combination_id &&
                                                                                teacherSubject.gradetimeslots === sl.id &&
                                                                                teacherSubject.academic === selectedAcademicId
                                                                        )
                                                                        .map((teacherSubject, index) => (
                                                                            <p key={index}>
                                                                                {teacherSubject.subject_name}
                                                                                <br />
                                                                                {teacherSubject.teacher_last_name}
                                                                                <br />
                                                                                {teacherSubject.room_name}
                                                                                <br/>
                                                                                {auth.user.is_superuser || auth.user.is_librarian?<>
                                                                                    <span onClick={() => handleDelete(teacherSubject.id)} style={styles.cancelButton}>Delete</span>
                                                                                        <br />
                                                                                        <br />
                                                                                    
                                                                                    <span onClick={() => handleUpdate(teacherSubject)} style={styles.updateEventButton}>Edit</span>
                                                                                </>:null}
                                                                                
                                                                            </p>
                                                                        ))
                                                                ) : (<>
                                                                        <p>Individual/Group work</p>
                                                                        {auth.user.is_superuser || auth.user.is_librarian?
                                                                        <span 
                                                                        style={styles.submitButton}
                                                                        onClick={() => changeFormData(comb.combination_id, sl.id, selectedAcademicId)} 
                                                                    >
                                                                        Add
                                                                    </span>:null
                                                                        }
                                                                        
                                                                    </>
                                                                    
                                                                )
                                                        }
                                                    </>
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>  
                                ))}
                                
                            </table>
                        )) }
                        
                </span>
            ))}
            {/* Modal */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <form style={styles.form}>
              <select
                name="subject"
                onChange={handleupdateChange}
                value={formupdateData.subject}
                style={styles.select}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>

              <select
                name="teacher"
                onChange={handleupdateChange}
                value={formupdateData.teacher}
                style={styles.select}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>

              <select
                name="room"
                onChange={handleupdateChange}
                value={formupdateData.room}
                style={styles.select}
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_name}
                  </option>
                ))}
              </select>

              <div style={styles.buttonContainer}>
                <span onClick={handleupdateSubmit} style={styles.submitButton}>
                  Submit
                </span>
                <span
                  onClick={() => {
                    setModalOpen(false);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
    );
};

export default TeacherSubjectList;
