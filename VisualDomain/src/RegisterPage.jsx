import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import './styles.css'; // Import your custom styles

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        
        // Validation
        if (!username || !email || !password || !repeatPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== repeatPassword) {
            alert('Passwords do not match');
            return;
        }

        // Assuming registration is successful
        alert(`User ${username} registered successfully!`);
        navigate('/'); // Redirect after registration
    };

    return (
        <div className="background-image">
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body card-body-white">
                    <h2 className="text-center text-black mb-4">Register</h2>
                    <form onSubmit={handleRegister}>
                        {/* Username Field */}
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

                        {/* Email Field */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label text-black">Email</label>
                            <input
                                type="email"
                                className="form-control bg-light text-black shadow-sm custom-focus"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Field */}
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

                        {/* Repeat Password Field */}
                        <div className="mb-3">
                            <label htmlFor="repeatPassword" className="form-label text-black">Repeat Password</label>
                            <input
                                type="password"
                                className="form-control bg-light text-black shadow-sm custom-focus"
                                id="repeatPassword"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                            />
                        </div>

                        {/* Register Button */}
                        <button type="submit" className="custom-btn w-100 mb-3">Register</button>
                    </form>

                    {/* Redirect to Login */}
                    <p className="text-center text-black mt-3">
                        Already have an account?{' '}
                        <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => navigate('/')}
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
