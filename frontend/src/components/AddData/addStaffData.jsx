import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust this path as needed

const AddStaff = () => {
  const initialFormData = {
    username: '',
    reg_number: '',     
    first_name: '',
    middle_name: '',
    rwandan_name: '',
    gender: '',
    dob: '',
    phone: '',
    alt_phone: '',
    email: '',
    alt_email: '',
    password: '',
    password_confirm: '', 
    position: '',
    is_superuser: false,
  };
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    const {
      username,
      password,
      password_confirm,
      position,
    } = formData;

    if (!username || !password || password !== password_confirm) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }

      // Create a mapping of position to boolean fields
    const roleFlags = {
      is_teacher: position === 'teacher',
      is_crc: position === 'crc',
      is_librarian: position === 'librarian',
      is_mama: position === 'mother',
      is_student: false,
      is_alumni: false,
      is_staff: true, 
    };

    const payload = {
      ...formData,
      ...roleFlags,
      position: undefined,
      dob: formData.dob || null, 
      email: formData.email || null,
      phone: formData.phone || null,
      alt_email: formData.email1 || null,
      alt_phone: formData.phone1 || null,
    };

    delete payload.position;
    console.log(payload);

    try {
      const res = await axios.post(`${baseUrl}/users/`, payload);
      alert("Staff added successfully!");
      setFormData(initialFormData);
    } catch (err) {
      console.error(err);
      alert("Failed to add staff. Check inputs or try again.");
    }
  };

  return (
    <form className="form-section" onSubmit={handleSubmit}>
      {[
        ['Username', 'username', 'text', true],
        ['Registration Number', 'reg_number', 'text', true],
        ['First Name', 'first_name', 'text', true],
        ['Middle Name', 'middle_name', 'text', false],
        ['Rwandan Name', 'rwandan_name', 'text', true],
        ['Phone', 'phone', 'tel', false],
        ['Alternate Phone', 'phone1', 'tel', false],
        ['Email', 'email', 'email', false],
        ['Alternate Email', 'email1', 'email', false],
        ['Password', 'password', 'password', true],
        ['Confirm Password', 'password_confirm', 'password', true],
      ].map(([label, name, type, required]) => (
        <React.Fragment key={name}>
          <label className={required ? 'required' : ''}>{label}</label>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required={required}
          />
        </React.Fragment>
      ))}

      <label className="required">Gender</label>
      <select name="gender" value={formData.gender} onChange={handleChange} required>
        <option value="">Select</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <label>Date of Birth</label>
      <input type="date" name="dob" value={formData.dob} onChange={handleChange} />

      <label className="required">Position</label>
      <select name="position" value={formData.position} onChange={handleChange} required>
        <option value="">Select position</option>
        <option value="crc">CRC</option>
        <option value="teacher">Teacher</option>
        <option value="librarian">Librarian</option>
        <option value="mother">Mother</option>
      </select>

      <div className="checkbox-inline">
        <label htmlFor="is_superuser">Superuser</label>
        <input
          id="is_superuser"
          type="checkbox"
          name="is_superuser"
          checked={formData.is_superuser}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Add Staff</button>
    </form>
  )}

export default AddStaff;
