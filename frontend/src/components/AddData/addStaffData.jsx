import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';

const AddStaff = ({ item, onSuccess, onCancel }) => {
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

  const [formData, setFormData] = useState(initialFormData);

  // ✅ Load form data from item when editing
  useEffect(() => {
    if (item) {
      setFormData({
        username: item.username || '',
        reg_number: item.reg_number || '',
        first_name: item.first_name || '',
        middle_name: item.middle_name || '',
        rwandan_name: item.rwandan_name || '',
        gender: item.gender || '',
        dob: item.dob || '',
        phone: item.phone || '',
        alt_phone: item.alt_phone || '',
        email: item.email || '',
        alt_email: item.alt_email || '',
        password: '',              // don't populate password
        password_confirm: '',
        position: getPositionFromRoles(item),
        is_superuser: item.is_superuser || false,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [item]);

  const getPositionFromRoles = (item) => {
    if (item.is_teacher) return 'teacher';
    if (item.is_crc) return 'crc';
    if (item.is_librarian) return 'librarian';
    if (item.is_mama) return 'mother';
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      username,
      password,
      password_confirm,
      position,
    } = formData;

    if (!username || (!item && !password) || (password && password !== password_confirm)) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }

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
      dob: formData.dob || null,
      email: formData.email || null,
      phone: formData.phone || null,
      alt_email: formData.alt_email || null,
      alt_phone: formData.alt_phone || null,
    };

    delete payload.position;
    delete payload.password_confirm;

    try {
      if (item && item.id) {
        // ✅ PUT (edit)
        await axios.put(`${baseUrl}/users/${item.id}/`, payload);
        alert("Staff updated successfully!");
      } else {
        // ✅ POST (add)
        await axios.post(`${baseUrl}/users/`, payload);
        alert("Staff added successfully!");
      }

      setFormData(initialFormData);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save staff. Check inputs or try again.");
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
        ['Alternate Phone', 'alt_phone', 'tel', false],
        ['Email', 'email', 'email', false],
        ['Alternate Email', 'alt_email', 'email', false],
        ['Password', 'password', 'password', !item],
        ['Confirm Password', 'password_confirm', 'password', !item],
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

      <button type="submit">{item ? 'Update' : 'Add'} Staff</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>Cancel</button>
      )}
    </form>
  );
};

export default AddStaff;
