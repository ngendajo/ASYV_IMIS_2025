import React, { useState, useEffect } from 'react';
import { fetchRooms, createRooms as createRoom, updateRooms as updateRoom, deleteRoom } from '../../services/roomServices';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function Rooms() {
    let { auth } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [editing, setEditing] = useState(null); // Track which room is being edited
    const [formData, setFormData] = useState({
        room_name: ''
    });

    useEffect(() => {
        fetchRooms(auth).then(response => setRooms(response.data));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this Room?");
        if (confirmed) {
            deleteRoom(auth, id)
                .then(() => {
                    setRooms(rooms.filter(item => item.id !== id));
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
        const roomToUpdate = rooms.find(sbj => sbj.id === id);
        updateRoom(auth, id, {
            room_name: roomToUpdate.room_name
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchRooms(auth).then(response => setRooms(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setRooms(prevRooms =>
            prevRooms.map(sbj =>
                sbj.id === id ? { ...sbj, [key]: value } : sbj
            )
        );
    };

    // Transform the Rooms data
    const transformedRooms = rooms
        .map(({ id, room_name }) => ({
            room_name: editing === id ? (
                <input
                    type="text"
                    name="room_name"
                    value={room_name}
                    onChange={(e) => handleInputChange(id, 'room_name', e.target.value)}
                />
            ) : (
                room_name
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
        createRoom(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                fetchRooms(auth).then(response => setRooms(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h2>Add Room</h2>
            <form className='formelement' onSubmit={handleSubmit}>
                <label htmlFor="room_name">Enter Room Name</label>
                <input
                    className='credentials'
                    type="text"
                    id="room_name"
                    name="room_name"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="loginbutton">
                    <button className='submitbuton'type="submit">Save</button> 
                </label>
            </form>
            <h2>Available Rooms</h2>
            <DynamicTable mockdata={transformedRooms} />
        </div>
    );
}
