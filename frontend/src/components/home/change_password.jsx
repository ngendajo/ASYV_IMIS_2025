import React, { useState } from "react";

const ChangePasswordModal = ({ onSubmit, onSkip }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    onSubmit(newPassword);
  };

  return (
    <div className="PopUpOverlay">
      <div className="PopUpWindow">
        <h3>Change Your Password</h3>
        <p>Please update your password for security reasons.</p>
        {error && <p className="errmsg">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="ConfirmButton">
          <button onClick={handleSubmit}>Update Password</button>
          <button onClick={onSkip}>Skip for now</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
