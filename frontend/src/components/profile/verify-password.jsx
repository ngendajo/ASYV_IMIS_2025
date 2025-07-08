import React, { useState } from 'react';

const VerifyCurrentPasswordModal = ({ onVerify, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    onVerify(currentPassword);
  };

  return (
    <div className="PopUpOverlay">
      <div className="PopUpWindow">
        <h3>Verify Your Identity</h3>
        <p>Please enter your current password to proceed.</p>
        {error && <p className="errmsg">{error}</p>}

        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <div className="ConfirmButton">
          <button onClick={handleVerify}>Verify</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCurrentPasswordModal;
