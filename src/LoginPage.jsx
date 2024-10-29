import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.logout) {
            setLogoutMessage('Successfully logged out');
            const timer = setTimeout(() => setLogoutMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setErrorMessage('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch('http://localhost:5169/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: username, password }),
            });

            if (response.ok) {
                const userData = await response.json();

                // Store user data, including ID, in localStorage
                localStorage.setItem('userData', JSON.stringify(userData));

                // Navigate to the main page
                navigate('/main');
            } else {
                const errorData = await response.json();
                setErrorMessage(
                    response.status === 401
                        ? 'Incorrect username or password.'
                        : errorData.message || 'Incorrect username or password.'
                );
            }
        } catch (error) {
            setErrorMessage(
                error instanceof TypeError
                    ? 'Network error. Please check your connection and try again.'
                    : 'Incorrect username or password.'
            );
        }
    };

    return (
        <div className="background-image">
            {logoutMessage && (
                <div className="alert alert-success text-center" style={{ position: 'fixed', top: '0px', width: '100%', zIndex: 1000 }}>
                    {logoutMessage}
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger text-center" style={{ position: 'fixed', top: '0px', width: '100%', zIndex: 1000 }}>
                    {errorMessage}
                </div>
            )}
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body card-body-white">
                    <h2 className="text-center text-black mb-4">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
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
