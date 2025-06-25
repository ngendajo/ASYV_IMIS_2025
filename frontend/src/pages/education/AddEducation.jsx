import React, { useState, useEffect } from 'react';
import '../contact/AlumniJobPosts.css';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import baseUrl from '../../api/baseUrl';

const AddEducationForm = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const currentDate = new Date().toLocaleDateString('en-GB');
    const jobToEdit = location.state?.job;

    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');
    const [activeTab, setActiveTab] = useState('new');

    useEffect(() => {
        if (jobToEdit) {
            setTitle(jobToEdit.title);
            setType(jobToEdit.op_type);
            setDescription(jobToEdit.description);
            setDate(jobToEdit.diedline);
            setLink(jobToEdit.link);
        }
    }, [jobToEdit]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (description.length > 200) {
            alert("Exceed character limit: 200");
            return;
        }
        const opportunityData = {
            title: title,
            op_type: type,
            user: auth.user.id,
            description: description,
            post_time: currentDate,
            diedline: date,
            link: link
        };

        const url = jobToEdit ? `${baseUrl}/education/${jobToEdit.id}/update/` : `${baseUrl}/education/create/`;
        const method = jobToEdit ? 'put' : 'post';
        axios({
            method: method,
            url: url,
            data: opportunityData,
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            console.log(res);
            navigate('/further_education');
        })
        .catch(error => console.log(error));
    };

    return (
        <div className="JobContainer">
          <div className="job-tabs">
            <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>New Education</button>
            <button className={activeTab === 'submitted' ? 'active' : ''} onClick={() => setActiveTab('submitted')}>Submitted Cards</button>
          </div>

          <div className="job-request-form" style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
            <form onSubmit={handleSubmit}>
              <div className="job-request-form-grid">
                {/* 1. Job Title */}
                <input type="text" placeholder="Card Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                {/* 2. Job Type */}
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="" disabled>Select Card Type</option>
                  <option value="Full Time">Online Courses</option>
                  <option value="Part Time">Summer Program</option>
                  <option value="Internship">Online Book</option>
             
                </select>
                {/* 3. Link to Apply */}
                <input type="url" placeholder="Link to Apply" value={link} onChange={(e) => setLink(e.target.value)} required />
                {/* 4. Apply Deadline */}
                <input type="date" placeholder="Deadline" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              {/* 5. Job Description */}
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              <div className="char-count">Character Count: {description.length}/200</div>
              {/* 6. Submit */}
              <div className="submit-container">
                <button type="submit">Submit Request</button>
              </div>
            </form>
        </div>

          <div className="submitted-jobs" style={{ display: activeTab === 'submitted' ? 'block' : 'none' }}>
              {/* Simulate fetching of submitted jobs */}
              <h3>Submitted Education Cards</h3>
              <div className="submitted-jobs-list">
                  <p>No cards submitted yet.</p>
              </div>
          </div>
      </div>
  );
};

export default AddEducationForm;