import React, { useEffect, useState } from 'react';
import './alumni-detail.css';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import ProfileCard from '../profile/profile-card';
import ContactCard from '../profile/contact-card';


const AlumniDetail = ({ selectedAlumni, handleClear }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  if (!selectedAlumni) return null;

  const isStaff = auth.user?.is_crc || auth.user?.is_superuser;

  const combinationStyle = (combination) => combination?.replace(/-/g, ', ') || '';

  const handleViewClick = () => {
    console.log("alumni user id", selectedAlumni.user_id);
    navigate("/personal_profile", {
      state: { userId: selectedAlumni.user_id }
    });
  };

  return (
    <div className="alumni-detail-content">
      {isStaff ? (
        <>
          <ContactCard
            user={{
              data: {
                first_name: selectedAlumni.first_name || selectedAlumni.firstName,
                rwandan_name: selectedAlumni.rwandan_name || selectedAlumni.lastName,
                email: selectedAlumni.email,
                phone: selectedAlumni.phone
              }
            }}
            editable={true}
          />
          <ProfileCard propId={selectedAlumni.user_id} />
        </>
      ) : (
        <>
          <img src={selectedAlumni.profilePic} alt="Profile" className="detail-pic" />
          <div className="detail-first-name">{selectedAlumni.firstName}</div>
          <div className="detail-last-name">{selectedAlumni.lastName}</div>

          {(auth.user?.is_crc || auth.user?.is_superuser) && (
            <div>
              <div className="detail-contact-info">{selectedAlumni.email}</div>
              <div className="detail-contact-info">{selectedAlumni.phone}</div>
            </div>
          )}

          <div className="detail-grid">
            <div className="DetailTitle">ASYV Grade</div>
            <div className="DetailValue">{selectedAlumni.grade}</div>
            <div className="DetailTitle">ASYV Family</div>
            <div className="DetailValue">{selectedAlumni.family}</div>
            <div className="DetailTitle">Combination</div>
            <div className="DetailValue">{combinationStyle(selectedAlumni.combination)}</div>
            <div className="DetailTitle">Job Industry</div>
            <div className="DetailValue">{selectedAlumni.industry}</div>
            <div className="DetailTitle">Further Education</div>
            <div className="DetailValue">{selectedAlumni.further_education}</div>
          </div>
        </>
      )}
    </div>
  );
};


export default AlumniDetail;
