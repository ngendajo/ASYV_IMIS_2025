import { React, useState, useEffect } from "react"
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
// npm install jwt-decode
import { jwtDecode } from 'jwt-decode';
import Logo from '../../static/images/logo.png';

import axios from "../../api/axios";
import baseUrl from "../../api/baseUrl";
import ChangePasswordModal from "./change_password";

import "./login_pop_up.css";

const LOGIN_URL = '/token/';

export default function LoginPopUp({showLogin, toggleLoginPopup}) {

    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const [showForgotMessage, setShowForgotMessage] = useState(false);




    useEffect(() => {
        setErrMsg('');
    }, [email, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await axios.post(LOGIN_URL,
                    JSON.stringify({
                        username: email,
                        password: pwd
                    }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    }
                );

                const access = response?.data.access;
                const refresh = response?.data.refresh;
                const token = response?.data.token;
                const user = jwtDecode(token); // Using the token field which contains user data
                console.log("Decoded JWT user object:", user);
                setAccessToken(access);

                // You can now access user data directly from the decoded token
                // since it includes: first_name, rwandan_name, email, phone, is_superuser, etc

                setAuth({ user, accessToken: access, refresh });

                // Check user roles before proceeding
                if (!user.is_alumni && !user.is_staff) {
                    alert("You don't have access to this website yet.");
                    // Optionally, clear auth and tokens:
                    setAuth({});
                    setAccessToken('');
                    // Do not navigate
                    return;
                }
                const currentPwd = pwd;
                setEmail('');
                setPwd('');
                if (currentPwd === "Amahoro@1") {
                    setShowChangePasswordModal(true);
                  } else {
                    navigate(from, { replace: true });
                  }

            } catch (err) {
                if (!err?.response) {
                    setErrMsg("No response from server. Please check your internet connection.");
                } 
                else if (err.response.status === 400) {
                    setErrMsg('Incorrect email or password.');
                } else if (err.response.status === 401) {
                    setErrMsg('Unauthorized: Incorrect email or password.');
                } else if (err.response.status === 403) {
                    setErrMsg('Forbidden: You do not have permission to access this resource.');
                } else if (err.response.status === 404) {
                    setErrMsg('Not Found: The requested resource could not be found.');
                } else if (err.response.status === 500) {
                    setErrMsg('Internal Server Error: Please try again later.');
                } else {
                    setErrMsg('Login Failed: ' + err.message);
                }
            }}

    const handlePasswordChange = async (newPassword) => {
        //console.log("new password", newPassword)
        try {
            //console.log("request send")
            //console.log("Sending POST request to /changepassword/ with data:", { current_password: pwd, newPassword });

            await axios.post(baseUrl +
            "/changepassword/",
            { current_password: "Amahoro@1",
              new_password: newPassword },
            {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                },
            }
            );
            alert("Password changed successfully.");
            setShowChangePasswordModal(false);
            navigate(from, { replace: true });
        } catch (err) {
            alert("Failed to change password. Try again.", err);
        }
        };
              

    return (
        <div>
            {showLogin && (
                <div className="PopUpOverlay">
                    <div className="PopUpWindow">
                        <button className="CloseButton" onClick={toggleLoginPopup}>x</button>
                        <div className="LoginTitle">
                            <img src={Logo} alt="ASYV Logo"/>
                            <p>Welcome back to ASYV Alumni Platform!</p>
                        </div>
                        <p className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                            {errMsg}
                        </p>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="email">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </label>

                            <label htmlFor="password">
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    autoComplete="off"
                                    onChange={(e) => setPwd(e.target.value)}
                                    value={pwd}
                                    required
                                />
                            </label>
                            <div className="ConfirmButton">
                                <button type="submit">Login</button>
                            </div>
                            {showForgotMessage ? (
                                <p className="ForgotMessage">
                                    Please contact the CRC if you forgot your password.
                                </p>
                                ) : (
                                <button
                                    type="button"
                                    className="ForgotPasswordLink"
                                    onClick={() => setShowForgotMessage(true)}
                                >
                                    Forgot Password?
                                </button>
                                )}
                        </form>
                        </div>
                </div>
            )}
            {showChangePasswordModal && (
            <ChangePasswordModal
                onSubmit={handlePasswordChange}
                onSkip={() => {
                setShowChangePasswordModal(false);
                navigate(from, { replace: true });
                }}
            />
            )}       
        </div>
    )}