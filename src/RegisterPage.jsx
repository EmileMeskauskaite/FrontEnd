import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [startingMoney, setStartingMoney] = useState(null);
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        
        if (!username || !email || !password || !repeatPassword || startingMoney === null) {
            alert('Please fill in all fields and select a starting money amount');
            return;
        }

        if (password !== repeatPassword) {
            alert('Passwords do not match');
            return;
        }

        alert(`User ${username} registered successfully with starting money: $${startingMoney}!`);
        navigate('/'); // Redirect after registration
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body card-body-white">
                    <h2 className="text-center text-black mb-4">Register</h2>
                    <form onSubmit={handleRegister}>
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
                            <label htmlFor="email" className="form-label text-black">Email</label>
                            <input
                                type="email"
                                className="form-control bg-light text-black shadow-sm custom-focus"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        {/* Choose Starting Money Options */}
                        <div className="mb-3">
                            <label className="form-label text-black">Choose Starting Money</label>
                            <div className="button-group">
                                <button 
                                    type="button" 
                                    className={`custom-btn ${startingMoney === 10000 ? 'selected' : ''}`} 
                                    onClick={() => setStartingMoney(10000)}
                                >
                                    $10,000
                                </button>
                                <button 
                                    type="button" 
                                    className={`custom-btn ${startingMoney === 5000 ? 'selected' : ''}`} 
                                    onClick={() => setStartingMoney(5000)}
                                >
                                    $5,000
                                </button>
                                <button 
                                    type="button" 
                                    className={`custom-btn ${startingMoney === 1000 ? 'selected' : ''}`} 
                                    onClick={() => setStartingMoney(1000)}
                                >
                                    $1,000
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="custom-btn w-100 mb-3">Register</button>
                    </form>

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
