import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import ProfileCard from '../../components/profile/profile-card';
import ProfileImage from '../../components/dashboard/ProfileImage.jsx';
import useAuth from '../../hooks/useAuth';
import baseUrl from '../../api/baseUrl';
import '../../App.css';

const Profile = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const selectedID = location.state?.userId || auth.user.id;

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseUrl}/users/?id=${selectedID}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [selectedID, auth]);

  return (
    <div className="ProfileWrapper">
      {/* {user && (
        <ProfileImage user={user} size={100} canEdit={auth.user.id === user.id} />

      )} */}

      <ProfileCard propId={selectedID} />
      <Link to="/personal_profile-resume" className="toResume">Generate Resume &gt;</Link>
    </div>
  );
};

export default Profile;
