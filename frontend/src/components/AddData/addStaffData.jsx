import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust this path as needed

const AddStaff = () => {

  const initialFormData = {
    username: '',
    regNumber: '',
    firstName: '',
    middleName: '',
    rwandanName: '',
    gender: '',
    dob: '',
    phone: '',
    altPhone: '',
    email: '',
    altEmail: '',
    password: '',
    confirmPassword: '',
    position: '',
    isSuperuser: false,
  };
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.username || !formData.password || formData.password !== formData.confirm_password) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }
    const payload = {
        ...formData
      };
  
    try {
      const res = await axios.post(`${baseUrl}/api/kid/`, payload);
      alert("Student added successfully!");
      setFormData(initialFormData); // reset form if needed
    } catch (err) {
      console.error(err);
      alert("Failed to add student.");
    }
}

  return (
    <form className="form-section" onSubmit={handleSubmit}>
        {[
        ['Username', 'username', 'text', true],
        ['Registration Number', 'regNumber', 'text', true],
        ['First Name', 'firstName', 'text', true],
        ['Middle Name', 'middleName', 'text', false],
        ['Rwandan Name', 'rwandanName', 'text', true],
        ['Phone', 'phone', 'tel', false],
        ['Alternate Phone', 'altPhone', 'tel', false],
        ['Email', 'email', 'email', false],
        ['Alternate Email', 'altEmail', 'email', false],
        ['Password', 'password', 'password', true],
        ['Confirm Password', 'confirmPassword', 'password', true],
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
        <label htmlFor="superuser">Superuser</label>
        <input
            id="superuser"
            type="checkbox"
            name="isSuperuser"
            checked={formData.isSuperuser}
            onChange={handleChange}
        />
        </div>

        <button type="submit">Add Staff</button>
    </form>
  )}

export default AddStaff;
