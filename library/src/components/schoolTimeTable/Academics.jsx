import React, { useState, useEffect } from 'react';
import { fetchAcademics, createAcademic, updateAcademic, deleteAcademic } from '../../services/academicService';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function Academics() {
    let { auth } = useAuth();
    const [academics, setAcademics] = useState([]);
    const [editing, setEditing] = useState(null); // Track which academic is being edited
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchAcademics(auth).then(response => setAcademics(response.data));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this academic record?");
        if (confirmed) {
            deleteAcademic(auth, id)
                .then(() => {
                    setAcademics(academics.filter(item => item.id !== id));
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
        const academicToUpdate = academics.find(ac => ac.id === id);
        updateAcademic(auth, id, {
            start_date: academicToUpdate.start_date,
            end_date: academicToUpdate.end_date
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchAcademics(auth).then(response => setAcademics(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setAcademics(prevAcademics =>
            prevAcademics.map(ac =>
                ac.id === id ? { ...ac, [key]: value } : ac
            )
        );
    };

    // Transform the academics data
    const transformedAcademics = academics
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .map(({ id, start_date, end_date }) => ({
            start_date: editing === id ? (
                <input
                    type="date"
                    name="start_date"
                    value={start_date}
                    onChange={(e) => handleInputChange(id, 'start_date', e.target.value)}
                />
            ) : (
                start_date
            ),
            end_date: editing === id ? (
                <input
                    type="date"
                    name="end_date"
                    value={end_date}
                    onChange={(e) => handleInputChange(id, 'end_date', e.target.value)}
                />
            ) : (
                end_date
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
        createAcademic(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                fetchAcademics(auth).then(response => setAcademics(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h2>Add Academic Record</h2>
            <form className='formelement' onSubmit={handleSubmit}>
                <label htmlFor="start_date">Enter Start Date</label>
                <input
                    className='credentials'
                    type="date"
                    id="start_date"
                    name="start_date"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="end_date">Enter End Date</label>
                <input
                    className='credentials'
                    type="date"
                    id="end_date"
                    name="end_date"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="loginbutton">
                    <button className='submitbuton'type="submit">Save</button> 
                </label>
            </form>
            <h2>Available Academic Records</h2>
            <DynamicTable mockdata={transformedAcademics} />
        </div>
    );
}
