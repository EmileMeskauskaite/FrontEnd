import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import './styles.css'; // Import your custom styles

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

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
