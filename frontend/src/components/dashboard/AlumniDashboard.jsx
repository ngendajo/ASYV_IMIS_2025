// src/pages/AlumniDashboard.jsx
import React, { useEffect, useState } from 'react';
import '../../pages/dashboard/dashboard.css';
import './alumni-dashboard.css';
import useAuth from '../../hooks/useAuth';
import { Event } from '../social/events-cards';
import OpportunityCard from '../opportunities/opportunity-card';
import axios from 'axios';
// import baseUrl from '../../api/baseUrl';
const  baseUrl='https://backend.asyv.ac.rw/api';


const AlumniDashboard = () => {
  const { auth } = useAuth();
  const [events, setEvents] = useState([]);
  const [careerOps, setCareerOps] = useState([]);
  const [eduOps, setEduOps] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchOpportunities();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(baseUrl + '/events/', {
        // headers: {
        //   Authorization: 'Bearer ' + auth.accessToken,
        //   'Content-Type': 'multipart/form-data',
        // },
        // withCredentials: true,
      });
      setEvents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get(baseUrl + '/opportunity');
      const data = response.data.filter((item) => item.approved);
      setCareerOps(data.filter((item) =>
        ['Full Time', 'Part Time', 'Internship', 'Volunteer', 'Professional'].includes(item.op_type)
      ));
      setEduOps(data.filter((item) =>
        ['Courses', 'Programs'].includes(item.op_type)
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const requestSupport = (op) => {
    alert("CRC support requested.");
  };

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h1>Welcome back {auth.user.first_name}!</h1>
          <p>Is your profile up to date?</p>
        </div>
        <button
          className="update-profile-btn"
          onClick={() => window.location.href = '/personal_profile'}
        >
          Update Profile
        </button>
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Events</h2>
        <div className="scroll-wrapper">
          <div className="scroll-row">
            {events.map((event) => (
              <div className="card-item" key={event.id}>
                <Event
                  alumni="true"
                  title={event.title}
                  e_datetime={event.e_datetime}
                  buttonText={event.buttonText}
                  link={() => window.location.href = '/events-detail'}
                  timeFunction={(x) => new Date(x).toLocaleDateString()}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Career Opportunities For You</h2>
        <div className="scroll-wrapper">
          <div className="scroll-row">
            {careerOps.map((job) => (
              <div className="card-item" key={job.id}>
                <OpportunityCard
                  title={job.title}
                  description={job.description}
                  date={job.deadline}
                  link={job.link}
                  type={job.op_type}
                  company={job.organization}
                  onSupportRequest={() => requestSupport(job)}
                  renderActions={() => (
                    <>
                      <button onClick={() => window.open(job.link, '_blank')}>Apply</button>
                      <button onClick={() => requestSupport(job)}>Request CRC Support</button>
                    </>
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Education Opportunities For You</h2>
        <div className="scroll-wrapper">
          <div className="scroll-row">
            {eduOps.map((edu) => (
              <div className="card-item" key={edu.id}>
                <OpportunityCard
                  title={edu.title}
                  description={edu.description}
                  date={edu.deadline}
                  link={edu.link}
                  type={edu.op_type}
                  company={edu.organization}
                  onSupportRequest={() => requestSupport(edu)}
                  renderActions={() => (
                    <>
                      <button onClick={() => window.open(edu.link, '_blank')}>Learn More</button>
                      <button onClick={() => requestSupport(edu)}>Request CRC Support</button>
                    </>
                  )}
                  labelOverrides={{
                    organization: 'Institution',
                    title: 'Program Name',
                    description: 'Program Description',
                    date: 'Registration Deadline',
                    link: 'Learn More',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
