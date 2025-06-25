import React, { useState, useEffect } from 'react';
import MentorCard from '../../components/support/mentor-card';
import "./MentoringPrograms.css";
import { jwtDecode } from 'jwt-decode';
import useAuth from "../../hooks/useAuth";
import axios from '../../api/axios';
import baseUrl from '../../api/baseUrl';

const MentoringPrograms = () => {
  const [activeTab, setActiveTab] = useState('Mentors');
  const [mentors, setMentors] = useState([]);
  const [applications, setApplications] = useState([]);
  const { auth } = useAuth();
  const user = jwtDecode(auth.accessToken);

  const filteredMentors = mentors.filter(mentor => mentor.op_type === activeTab);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(baseUrl + '/mentorship_cards/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      setMentors(response.data);
    } catch (err) {
      console.log(err);
    }
  };
 
  const fetchApplications = async () => {
    try {
      const response = await axios.get(baseUrl + '/sample_applications/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      setApplications(response.data);
      console.log("applications 39: ",response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchApplications();
  }, []);

  const handleApply = async (opportunityId, opportunityTitle) => {
    console.log("opp: ",opportunityId)
    const alreadyApplied = applications.some(application => application.user.id === auth.user.id && application.mentorship === opportunityId);
    if (alreadyApplied) {
      alert('You have already applied to this mentorship event.');
      return;
    }

    const newApplication = {
      user_id: auth.user.id,
      mentorship: opportunityId,
      is_approved: false,
    };

   // console.log("new Application62", newApplication);

    try {
      await axios.post(baseUrl + '/sample_applications/', newApplication, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      fetchApplications();
      alert("Applied successfully!");
    } catch (err) {
      console.log(err.response);
    }
  };


  const handleApproval = async (id, isApproved, mentorshipId, user_id) => {
   
    try {
      await axios.put(`${baseUrl}/sample_applications/${id}/`, { user_id: user_id, is_approved: isApproved, mentorship: mentorshipId}, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      setApplications(applications.map(application =>
        application.id === id ? { ...application, is_approved: isApproved } : application
      ));

      alert(" successful");
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleDeny= async (id) => {
    try {
      await axios.delete(`${baseUrl}/sample_applications/${id}/`,  {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });

    fetchApplications();

      alert("Deleted Successfully");
    } catch (err) {
      console.log(err.response);
    }
  };

  const getMentorshipTitle = (mentorshipId) => {
    const mentorship = mentors.find(m => m.id === mentorshipId);
    return mentorship ? mentorship.title : 'Unknown';
  };


console.log("application",applications)
  return (
    <div className="mentors-page">
      <div className="tabs">
        <button onClick={() => setActiveTab('Mentors')} className={activeTab === 'Mentors' ? 'active' : ''}>Mentors</button>
        <button onClick={() => setActiveTab('Volunteers')} className={activeTab === 'Volunteers' ? 'active' : ''}>Volunteers</button>
        <button onClick={() => setActiveTab('Workshops')} className={activeTab === 'Workshops' ? 'active' : ''}>Workshops</button>
        {user.crc_staff || user.is_superuser ? (
          <button onClick={() => setActiveTab('Applications')} className={activeTab === 'Applications' ? 'active' : ''}>Applications</button>
        ) : (
          <button onClick={() => setActiveTab('Applied')} className={activeTab === 'Applied' ? 'active' : ''}>Applied</button>
        )}
      </div>

      {activeTab !== 'Applications' && activeTab !== 'Applied' && (
        <div className="mentors-cards-container">
          {filteredMentors.map(mentor => (
            <MentorCard
              key={mentor.id}
              title={mentor.title}
              type={mentor.op_type}
              description={mentor.description}
              date={mentor.date}
              location={mentor.location}
              onApply={() => handleApply(mentor.id)}
            />
          ))}
        </div>
      )}

      {activeTab === 'Applications' && (
        <div className="applications-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Opportunity Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application.id}>
                 <td>{application.user.first_name}</td>
                 <td>{application.user.email}</td>
                  <td>{getMentorshipTitle(application.mentorship)}</td>
                  <td>{application.is_approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    <button onClick={() => handleApproval(application.id, true, application.mentorship, auth.user.id)}>Approve</button>
                    <button onClick={() => handleDeny(application.id)}>Deny</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Applied' && (
        <div className="applications-container">
          <table>
            <thead>
              <tr>
                <th>Opportunity Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.filter(application => application.user.id === auth.user.id).map(application => (
                <tr key={application.id}>
                 <td>{getMentorshipTitle(application.mentorship)}</td>
                  <td>{application.is_approved ? 'Approved' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentoringPrograms;
