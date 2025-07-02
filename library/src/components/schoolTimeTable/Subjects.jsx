import React, { useState, useEffect } from 'react';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectService';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function Subjects() {
    let { auth } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [editing, setEditing] = useState(null); // Track which subject is being edited
    const [formData, setFormData] = useState({
        subject_name: ''
    });

    useEffect(() => {
        fetchSubjects(auth).then(response => setSubjects(response.data));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this subject?");
        if (confirmed) {
            deleteSubject(auth, id)
                .then(() => {
                    setSubjects(subjects.filter(item => item.id !== id));
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
        const subjectToUpdate = subjects.find(sbj => sbj.id === id);
        updateSubject(auth, id, {
            subject_name: subjectToUpdate.subject_name
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchSubjects(auth).then(response => setSubjects(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setSubjects(prevSubjects =>
            prevSubjects.map(sbj =>
                sbj.id === id ? { ...sbj, [key]: value } : sbj
            )
        );
    };

    // Transform the Subjects data
    const transformedSubjects = subjects
        .map(({ id, subject_name }) => ({
            subject_name: editing === id ? (
                <input
                    type="text"
                    name="subject_name"
                    value={subject_name}
                    onChange={(e) => handleInputChange(id, 'subject_name', e.target.value)}
                />
            ) : (
                subject_name
            ),
            edit: editing === id ? (
                <span
                    onClick={() => handleSave(id)}
                    style={{ cursor: 'pointer' }}  // Set cursor to pointer
                >
                    <BiSave className='icon' />
                </span>
            ) : (
                <span
                    onClick={() => handleEdit(id)}
                    style={{ cursor: 'pointer' }}  // Set cursor to pointer
                >
                    <BiEditAlt className='icon' />
                </span>
            ),
            delete: (
                <span
                    onClick={() => handleDelete(id)}
                    style={{ cursor: 'pointer' }}  // Set cursor to pointer
                >
                    Delete
                </span>
            )
        }));

    const handleSubmit = (e) => {
        e.preventDefault();
        createSubject(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                fetchSubjects(auth).then(response => setSubjects(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h2>Add Subject</h2>
            <form className='formelement' onSubmit={handleSubmit}>
                <label htmlFor="subject_name">Enter Subject Name</label>
                <input
                    className='credentials'
                    type="text"
                    id="subject_name"
                    name="subject_name"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="loginbutton">
                    <button className='submitbuton'type="submit">Save</button> 
                </label>
            </form>
            <h2>Available Subjects</h2>
            <DynamicTable mockdata={transformedSubjects} />
        </div>
    );
}
