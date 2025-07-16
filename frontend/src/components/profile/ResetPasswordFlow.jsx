import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // your API base URL
import useAuth from '../../hooks/useAuth';

const ResetPasswordButton = ({ userId }) => {
  const { auth } = useAuth();

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;

    try {
      const res = await axios.post(
        `${baseUrl}/users/${userId}/reset-password/`,
        {}, // no body needed
        {
          headers: {
            Authorization: 'Bearer ' + auth.accessToken, // or 'Token ' if using token auth
          },
          withCredentials: true,
        }
      );
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      console.error('Reset password failed:', err);
      const msg =
        err.response?.data?.error || err.message || 'Unknown error';
      alert(`❌ Failed: ${msg}`);
    }
  };

  return (
    <button type="button" className="reset-password-button" onClick={handleReset}>
      Reset Password
    </button>
  );
};

export default ResetPasswordButton