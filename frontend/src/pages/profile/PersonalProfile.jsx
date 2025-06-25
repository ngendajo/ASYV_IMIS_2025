import React from 'react';
import './PersonalProfile.css';
import ProfileCard from '../../components/profile/profile-card';
import { Link, useLocation } from 'react-router-dom';
import '../../App.css';

const Profile = () => {
  const location = useLocation();
  const selectedID = location.state?.userId; // passed from alumni-detail

  console.log("Seleced iD", selectedID);
  return (
    <div className="ProfileWrapper">
      <ProfileCard propId={selectedID} />
      <Link to="/personal_profile-resume" className="toResume">Generate Resume &gt;</Link>
    </div>
  );
};

export default Profile;
