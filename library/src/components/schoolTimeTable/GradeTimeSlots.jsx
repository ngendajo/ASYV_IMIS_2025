import React, { useState, useEffect } from 'react';
import { fetchGradeTimeSlots, createGradeTimeSlot, updateGradeTimeSlot, deleteGradeTimeSlot } from '../../services/gradeTimeSlotsService';
import { fetchTimeSlots } from '../../services/timeSlotsService';
import { fetchGrades } from '../../services/gradeService';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function GradeTimeSlots() {
    let { auth } = useAuth();
    const [gradetimeslots, setgradetimeslots] = useState([]);
    const [grades, setGrades] = useState([]);
    const [timeslotsdata, setTimeslotsdata] = useState([]);
    const [editing, setEditing] = useState(null); // Track which timeslot is being edited
    const [formData, setFormData] = useState({
        day_of_week: "",
        activity: "",
        grade: "",
        timeslots: ""
    });
   
    useEffect(() => {
        fetchGradeTimeSlots(auth).then(response => setgradetimeslots(response.data));
        fetchGrades(auth).then(response => setGrades(response.data));
        fetchTimeSlots(auth)
            .then(response => {
                // Sort timeslots by start_time
                const sortedTimeslots = response.data.sort((a, b) => a.start_time.localeCompare(b.start_time));
                setTimeslotsdata(sortedTimeslots);
            });
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this time slot?");
        if (confirmed) {
            deleteGradeTimeSlot(auth, id)
                .then(() => {
                    setgradetimeslots(gradetimeslots.filter(item => item.id !== id));
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleEdit = (id) => {
        setEditing(id);
    };

    const handleSave = (id) => {
        const gradetimeslotToUpdate = gradetimeslots.find(slot => slot.id === id);
        updateGradeTimeSlot(auth, id, {
            day_of_week: gradetimeslotToUpdate.day_of_week,
            activity: gradetimeslotToUpdate.activity,
            grade: gradetimeslotToUpdate.grade,
            timeslots: gradetimeslotToUpdate.timeslots
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchGradeTimeSlots(auth).then(response => setgradetimeslots(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setgradetimeslots(prevGradeTimeslots =>
            prevGradeTimeslots.map(slot =>
                slot.id === id ? { ...slot, [key]: value } : slot
            )
        );
    };

    // Transform the timeslots data
    const transformedTimeslots = gradetimeslots
    .sort((a, b) => {
        // Get grade names
        const gradeA = grades.find(grade => grade.id === a.grade)?.grade_name || '';
        const gradeB = grades.find(grade => grade.id === b.grade)?.grade_name || '';
        if (gradeA !== gradeB) {
            return gradeA.localeCompare(gradeB);
        }

        // Compare day_of_week
        const dayOfWeekMapping = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5
        };
        
        const dayOfWeekA = dayOfWeekMapping[a.day_of_week] || -1; // -1 for undefined days
        const dayOfWeekB = dayOfWeekMapping[b.day_of_week] || -1;
        
        if (dayOfWeekA !== dayOfWeekB) {
            return dayOfWeekA - dayOfWeekB;
        }
        

        // Get start times
        const startTimeA = timeslotsdata.find(timeslot => timeslot.id === a.timeslots)?.start_time || '';
        const startTimeB = timeslotsdata.find(timeslot => timeslot.id === b.timeslots)?.start_time || '';
        return startTimeA.localeCompare(startTimeB);
    })
    .map(({ id, day_of_week, activity, grade, timeslots }) => {
        const grade_name = grades.find(g => g.id === grade)?.grade_name || '';
        const timeslot = timeslotsdata.find(t => t.id === timeslots);
        const start_time = timeslot?.start_time || '';
        const end_time = timeslot?.end_time || '';

        return {
            Grade: editing === id ? (
                <select
                    name="grade"
                    value={grade}
                    onChange={(e) => handleInputChange(id, 'grade', e.target.value)}
                >
                    {grades.map(g => (
                        <option key={g.id} value={g.id}>
                            {g.grade_name}
                        </option>
                    ))}
                </select>
            ) : (
                grade_name
            ),
            "Day of week": editing === id ? (
                <select
                    name="day_of_week"
                    value={day_of_week}
                    onChange={(e) => handleInputChange(id, 'day_of_week', e.target.value)}
                >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                </select>

            ) : (
                day_of_week
            ),
            Activity: editing === id ? (
                <input
                    type="text"
                    name="activity"
                    value={activity}
                    onChange={(e) => handleInputChange(id, 'activity', e.target.value)}
                />
            ) : (
                activity
            ),
            Timeslots: editing === id ? (
                <select
                    name="timeslots"
                    value={timeslots}
                    onChange={(e) => handleInputChange(id, 'timeslots', e.target.value)}
                >
                    {timeslotsdata.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.start_time} - {t.end_time}
                        </option>
                    ))}
                </select>
            ) : (
                `${start_time} - ${end_time}`
            ),
            edit: editing === id ? (
                <span
                    onClick={() => handleSave(id)}
                    style={{ cursor: 'pointer' }}
                >
                    <BiSave className='icon' />
                </span>
            ) : (
                <span
                    onClick={() => handleEdit(id)}
                    style={{ cursor: 'pointer' }}
                >
                    <BiEditAlt className='icon' />
                </span>
            ),
            delete: (
                <span
                    onClick={() => handleDelete(id)}
                    style={{ cursor: 'pointer' }}
                >
                    Delete
                </span>
            )
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createGradeTimeSlot(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                fetchGradeTimeSlots(auth).then(response => setgradetimeslots(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h2>Add Grade TimeSlot</h2>
            <form className='formelement' onSubmit={handleSubmit}>
                <label htmlFor="grade">Enter Grade</label>
                <select
                    className='credentials'
                    id="grade"
                    name="grade"
                    onChange={handleChange}
                    required
                >
                    {grades.map(g => (
                        <option key={g.id} value={g.id}>
                            {g.grade_name}
                        </option>
                    ))}
                </select>
                <label htmlFor="activity">Enter Activity</label>
                <input
                    className='credentials'
                    type="text"
                    id="activity"
                    name="activity"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="day_of_week">Enter Day of Week</label>
                
                <select
                    className='credentials'
                    name="day_of_week"
                    onChange={handleChange}
                >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                </select>
                <label htmlFor="timeslots">Enter Timeslot</label>
                <select
                    className='credentials'
                    id="timeslots"
                    name="timeslots"
                    onChange={handleChange}
                    required
                >
                    {timeslotsdata.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.start_time} - {t.end_time}
                        </option>
                    ))}
                </select>
                <label htmlFor="loginbutton">
                    <button className='submitbuton' type="submit">Save</button> 
                </label>
            </form>
            <h2>Available Grade TimeSlots</h2>
            <DynamicTable mockdata={transformedTimeslots} />
        </div>
    );
}
