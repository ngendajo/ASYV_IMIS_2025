import React, { useState, useEffect } from 'react';
import { fetchCombinations } from '../../services/combinationService';
import { fetchGradeTimeSlots } from '../../services/gradeTimeSlotsService';
import { fetchSubjects } from '../../services/subjectService';
import { fetchUsers } from '../../services/userService';
import { createTeacherCombinationGradeSubject } from '../../services/teacherSubjectService';
import useAuth from "../../hooks/useAuth";

const TeacherSubjectForm = () => {
    const [combinations, setCombinations] = useState([]);
    const [gradetimeslots, setGradetimeslots] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    let {auth} = useAuth();
    const [formData, setFormData] = useState({
        combination: '',
        gradetimeslots: '',
        teacher: '',
        subject: ''
    });

    useEffect(() => {
        fetchCombinations(auth).then(response => setCombinations(response.data));
        fetchGradeTimeSlots(auth).then(response => setGradetimeslots(response.data));
        fetchSubjects(auth).then(response => setSubjects(response.data));
        fetchUsers(auth).then(response => setTeachers(response.data.filter(user => user.is_superuser)));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createTeacherCombinationGradeSubject(auth,formData)
            .then(response => {
                console.log('Created successfully', response.data);
                // handle success (e.g., redirect, show message)
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Grade Time Slot</label>
                <select name="gradetimeslots" onChange={handleChange}>
                    <option value="">Select Grade Time Slot</option>
                    {gradetimeslots.map(gradetimeslot => (
                        <option key={gradetimeslot.id} value={gradetimeslot.id}>{gradetimeslot.day_of_week}{gradetimeslot.activity}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Combination</label>
                <select name="combination" onChange={handleChange}>
                    <option value="">Select Combination</option>
                    {combinations.map(comb => (
                        <option key={comb.id} value={comb.id}>{comb.combination_name}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label>Teacher</label>
                <select name="teacher" onChange={handleChange}>
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Subject</label>
                <select name="subject" onChange={handleChange}>
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.subject_name}</option>
                    ))}
                </select>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default TeacherSubjectForm;
