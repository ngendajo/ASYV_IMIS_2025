import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import ProfileCard from '../../components/profile/profile-card';
import ProfileImage from '../../components/dashboard/ProfileImage.jsx';
import useAuth from '../../hooks/useAuth';
import baseUrl from '../../api/baseUrl';
import '../../App.css';
import ContactCard from '../../components/profile/contact-card';
import ChangePasswordFlow from '../../components/profile/ChangePasswordFlow';


const Profile = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const selectedID = location.state?.userId || auth.user.id;

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseUrl}/users/${selectedID}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        setUser(res.data);
        console.log("user", user)
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [selectedID, auth]);

  return (
  <div className="ProfileWrapper">
    {user && (
      <ContactCard
        user={user}
        editable={auth.user?.id === selectedID}
        onEditPicture={() => alert("Open profile picture edit modal")}
      />
    )}

    {auth.user.is_alumni ? (
      <>
        <ProfileCard propId={selectedID} />
        <Link to="/personal_profile-resume" className="toResume">Generate Resume &gt;</Link>
      </>
    ) : (
      <ChangePasswordFlow />
    )}
  </div>
);

};

export default Profile;
