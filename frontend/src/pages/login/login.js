import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../../components/Constants/base_url'; // Update with actual base URL

const Login = () => {
    const { setIsLoggedIn, setUserId } = useContext(StoreContext);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Track loading state
    const [error, setError] = useState(''); // Track error message
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading when login is pressed
        setError(''); // Clear any previous errors

        try {
            console.log("--------HELLO WORLD-------");
            // Replace with actual login API endpoint, assuming POST to `/login` with password
            const response = await axios.post(`${baseUrl}login`, { password });

            if (response.status === 200) {
                const { user_id } = response.data.user;
                setUserId(user_id);
                setIsLoggedIn(true);
                navigate('/home', { replace: true }); // Redirect to home page after successful login
            }
        } catch (error) {
            setError('Invalid password or user not found'); // Show error if login fails
        } finally {
            setLoading(false); // Stop loading after process
        }
    };

    return (
        <div className='login-popup'>
            <form className='login-popup-container' onSubmit={handleLogin}>
                <div className='login-popup-title'>
                    <h2>Login</h2>
                </div>
                <div className='loging-popup-inputs'>
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type='submit' disabled={loading}>
                    {loading ? <div className="spinner"></div> : "Login"} {/* Show spinner or text */}
                </button>
                {error && <p className="error-message">{error}</p>} {/* Show error message if any */}
            </form>
        </div>
    );
}

export default Login;
