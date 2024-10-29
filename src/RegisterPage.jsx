import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [startingMoney, setStartingMoney] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < minLength) {
            return 'Password must be at least 8 characters long';
        }
        if (!hasUpperCase) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!hasNumber) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!username || !email || !password || !repeatPassword || startingMoney === null || !firstName || !lastName || !dateOfBirth) {
            setError('Please fill in all fields and select a starting money amount');
            //setShowErrorModal(true);
            return;
        }

        if (password !== repeatPassword) {
            setError('Passwords do not match');
            //setShowErrorModal(true);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            //setShowErrorModal(true);
            return;
        }

        const newUser = {
            userName: username,
            password: password,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            balance: startingMoney,
            simulationLevel: parseInt(difficulty), // Convert difficulty to number if needed
        };

        try {
            const response = await fetch('http://localhost:5169/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to register');
            }

            const registeredUser = await response.json();
            setShowSuccessModal(true);

            // Navigate to home page after closing modal
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/');
            }, 5000);
        } catch (err) {
            setError(err.message || 'Failed to register');
            //setShowErrorModal(true);
        }
    };

    return (
        <div className="background-image">
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="card shadow-lg" style={{ width: '400px' }}>
                    <div className="card-body card-body-white">
                        <h2 className="text-center text-black mb-4">Register</h2>
                        <form onSubmit={handleRegister}>
                            {error && <div className="alert alert-danger">{error}</div>}
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

                            {/* Additional Fields */}
                            <div className="mb-3">
                                <label htmlFor="firstName" className="form-label text-black">First Name</label>
                                <input
                                    type="text"
                                    className="form-control bg-light text-black shadow-sm custom-focus"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="lastName" className="form-label text-black">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control bg-light text-black shadow-sm custom-focus"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dateOfBirth" className="form-label text-black">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control bg-light text-black shadow-sm custom-focus"
                                    id="dateOfBirth"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
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
                                <label className="form-label text-black">Choose Starting Money </label>
                                <div className="button-group">
                                <button 
                                    type="button" 
                                    className={`custom-btn ${startingMoney === 10000 ? 'selected' : ''}`} 
                                    onClick={() => {
                                        setStartingMoney(10000);
                                        setDifficulty('0'); // Adjust 'easy' to match the intended difficulty level
                                        }}
                                    >
                                        Easy $10,000
                                    </button>

                                    <button 
                                        type="button" 
                                        className={`custom-btn ${startingMoney === 5000 ? 'selected' : ''}`} 
                                        onClick={() => {
                                            setStartingMoney(5000);
                                            setDifficulty('1');
                                        }}
                                    >
                                        Normal $5,000
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`custom-btn ${startingMoney === 1000 ? 'selected' : ''}`} 
                                        onClick={() => {
                                            
                                            setStartingMoney(1000);
                                            setDifficulty('2');
                                        
                                        }}
                                    >
                                        Hard $1,000
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

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Registration Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>User registered successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Error Modal */}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{error}</Modal.Body>
            </Modal>
        </div>
    );
};

export default RegisterPage;
