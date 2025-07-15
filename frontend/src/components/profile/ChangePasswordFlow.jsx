// components/profile/ChangePasswordFlow.jsx
import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import useAuth from '../../hooks/useAuth';

import VerifyCurrentPasswordModal from './verify-password';
import ChangePasswordModal from '../home/change_password';

const ChangePasswordFlow = ({ triggerLabel = "Change Password", onSuccess = () => {} }) => {
  const { auth } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [userEmail, setUserEmail] = useState(auth.user?.email || '');

  const handleVerify = async (password) => {
    try {
      await axios.post(`${baseUrl}/token/`, {
        username: userEmail,
        password
      });

      setVerifiedPassword(password);
      setShowVerifyModal(false);
      setShowChangeModal(true);
    } catch {
      alert("Verification failed: Incorrect password.");
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      await axios.post(`${baseUrl}/changepassword/`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });

      alert("Password changed successfully!");
      setShowChangeModal(false);
      onSuccess();
    } catch {
      alert("Failed to change password.");
    }
  };

  return (
    <>
      <button onClick={() => setShowVerifyModal(true)}>{triggerLabel}</button>

      {showVerifyModal && (
        <VerifyCurrentPasswordModal
          onVerify={handleVerify}
          onCancel={() => setShowVerifyModal(false)}
        />
      )}

      {showChangeModal && (
        <ChangePasswordModal
          onSubmit={(newPassword) => handlePasswordChange(verifiedPassword, newPassword)}
          onSkip={() => setShowChangeModal(false)}
        />
      )}
    </>
  );
};

export default ChangePasswordFlow;
