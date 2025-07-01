import { React, useState, useEffect } from "react"
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
// npm install jwt-decode
import { jwtDecode } from 'jwt-decode';
import Logo from '../../static/images/logo.png';

import axios from "../../api/axios";

const LOGIN_URL = '/token/';

export default function LoginPopUp({showLogin, toggleLoginPopup}) {

    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

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

                const accessToken = response?.data.access;
                const refresh = response?.data.refresh;
                const token = response?.data.token;
                const user = jwtDecode(token); // Using the token field which contains user data
                console.log("Decoded JWT user object:", user);

                // You can now access user data directly from the decoded token
                // since it includes: first_name, rwandan_name, email, phone, is_superuser, etc

                setAuth({ user, accessToken, refresh });
                setEmail('');
                setPwd('');
                navigate(from, { replace: true });
            } catch (err) {
                if (!err?.response) {
                    setErrMsg("No response from server. Please check your internet connection.");
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
                            <Link to="/home" className="ForgetPassword">Forgot Password?</Link>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )}