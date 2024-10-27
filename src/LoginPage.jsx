import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import './styles.css'; // Import your custom styles

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for a logout state from the previous page
        if (location.state?.logout) {
            setLogoutMessage('Successfully logged out');
            // Clear the message after 5 seconds
            const timer = setTimeout(() => {
                setLogoutMessage('');
            }, 5000);
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [location.state]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username && password) {
            navigate('/main', { state: { username } });
        } else {
            alert('Please enter both username and password');
        }
    };

    return (
        <div className="background-image">
            {logoutMessage && (
                <div className="alert alert-success text-center" style={{ position: 'fixed', top: '0px', width: '100%', zIndex: 1000 }}>
                    {logoutMessage}
                </div>
            )}
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body card-body-white">
                    <h2 className="text-center text-black mb-4">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3 ">
                            <label htmlFor="username" className="form-label text-black">Username</label>
                            <input
                                type="text"
                                className="form-control bg-light text-black shadow-sm custom-focus"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label text-black">Password</label>
                            <input
                                type="password"
                                className="form-control bg-light text-black shadow-sm custom-focus"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="custom-btn w-100 mb-3">Login</button>
                    </form>
                    <p className="text-center text-black mt-3">
                        Don't have an account?{' '}
                        <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => navigate('/register')}
                        >
                            Register now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
