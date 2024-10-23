import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Login.css';
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
    const { setIsLoggedIn } = useContext(StoreContext);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Track loading state
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true); // Start loading when login is pressed


        // Simulate login validation delay
        setTimeout(() => {
            if (password === '1234') {
                setIsLoggedIn(true);
                navigate('/home', { replace: true });
            } else {
                alert("Invalid password");
            }
            setLoading(false); // Stop loading after process
        }, 2000); // Simulate a 2-second delay for the login process
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
            </form>
        </div>
    );
}

export default Login;
