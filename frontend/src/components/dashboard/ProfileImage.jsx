import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import useAuth from '../../hooks/useAuth';

const defaultImage = '/default-profile-picture.jpg';

const ProfileImage = ({ user, canEdit = false, size = 120 }) => {
  const { auth } = useAuth();
  const [imgSrc, setImgSrc] = useState(user?.image_url || defaultImage);
  const [msg, setMsg] = useState('');

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      await axios.post(`${baseUrl}/updateuserimage/${user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setMsg('Image updated successfully');

      // Refresh user image
      const updated = await axios.get(`${baseUrl}/users/?id=${user.id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        withCredentials: true,
      });
      setImgSrc(updated.data.image_url || defaultImage);
    } catch (err) {
      setMsg('Image update failed');
      console.error(err);
    }
  };

  const handleError = () => {
    setImgSrc(defaultImage);
  };

  return (
    <div
      className="ProfileImageWrapper"
      style={{
        position: 'relative',
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        padding: 6,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <img
        src={imgSrc}
        alt="Profile"
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />

      {canEdit && (
        <label
          htmlFor={`imageUpload-${user.id}`}
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            backgroundColor: 'transparent',
            color: 'var(--orange)',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: 12,
          }}
          title="Change photo"
        >
          ✎
          <input
            id={`imageUpload-${user.id}`}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </label>
      )}


      {msg && (
        <span style={{ color: 'var(--green)', fontFamily: 'Medium', marginTop: 4 }}>
          {msg}
        </span>
      )}
    </div>
  );
};

export default ProfileImage;
