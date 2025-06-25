import React from 'react';
import './PersonalProfile.css';
import ProfileCardStaff from '../../components/profile/profile-card-staff';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../App.css';

const PersonalProfileStaff = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedID = location.state?.selectedID;
  return (
    <div className="ProfileWrapper">
      <ProfileCardStaff selectedID={selectedID}/>
      <button onClick={() => navigate(-1)} className="toResume">Back &gt;</button>
    </div>
  );
};
  
export default PersonalProfileStaff;