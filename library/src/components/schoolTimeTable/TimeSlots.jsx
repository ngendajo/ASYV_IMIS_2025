import React, { useState, useEffect } from 'react';
import { fetchTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../../services/timeSlotsService';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function TimeSlots() {
    let { auth } = useAuth();
    const [timeslots, setTimeslots] = useState([]);
    const [editing, setEditing] = useState(null); // Track which timeslot is being edited
    const [formData, setFormData] = useState({
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchTimeSlots(auth).then(response => setTimeslots(response.data));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
      const confirmed = window.confirm("Are you sure you want to delete this time slot?");
      if (confirmed) {
          deleteTimeSlot(auth, id)
              .then(() => {
                  setTimeslots(timeslots.filter(item => item.id !== id));
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
        const timeslotToUpdate = timeslots.find(slot => slot.id === id);
        updateTimeSlot(auth, id, {
            start_time: timeslotToUpdate.start_time,
            end_time: timeslotToUpdate.end_time
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchTimeSlots(auth).then(response => setTimeslots(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setTimeslots(prevTimeslots =>
            prevTimeslots.map(slot =>
                slot.id === id ? { ...slot, [key]: value } : slot
            )
        );
    };

    // Transform the timeslots data
    const transformedTimeslots = timeslots
    .sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.start_time}Z`);
        const timeB = new Date(`1970-01-01T${b.start_time}Z`);
        return timeA - timeB;
    })
    .map(({ id, start_time, end_time }) => ({
        start_time: editing === id ? (
            <input
                type="time"
                name="start_time"
                value={start_time}
                onChange={(e) => handleInputChange(id, 'start_time', e.target.value)}
            />
        ) : (
            start_time
        ),
        end_time: editing === id ? (
            <input
                type="time"
                name="end_time"
                value={end_time}
                onChange={(e) => handleInputChange(id, 'end_time', e.target.value)}
            />
        ) : (
            end_time
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
        createTimeSlot(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                fetchTimeSlots(auth).then(response => setTimeslots(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h2>Add TimeSlot</h2>
            <form className='formelement' onSubmit={handleSubmit}>
                <label htmlFor="start_time">Enter Start Time</label>
                <input
                    className='credentials'
                    type="time"
                    id="start_time"
                    name="start_time"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="end_time">Enter End Time</label>
                <input
                    className='credentials'
                    type="time"
                    id="end_time"
                    name="end_time"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="loginbutton">
            <button className='submitbuton'type="submit">Save</button> 
            </label>
                </form>
                <h2>Available TimeSlots</h2>
                <DynamicTable mockdata={transformedTimeslots} />
            </div>
    );
}
