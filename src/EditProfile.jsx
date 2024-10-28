import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const EditProfile = () => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        userName: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        balance: 0,
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatedPassword, setRepeatedPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData({
                ...parsedUserData,
                dateOfBirth: parsedUserData.dateOfBirth || new Date().toISOString().split('T')[0],
                balance: parsedUserData.balance || 0,
            });
        }
    }, []);

    const updateUserCredentials = async () => {
        try {
            const response = await fetch('http://localhost:5169/api/user/updateusercredentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            localStorage.setItem('userData', JSON.stringify(userData));
            setMessage("Profile updated successfully!");
            setMessageType('success');
            setShowModal(true);
        } catch (error) {
            setMessage("Failed to update profile.");
            setMessageType('error');
            setShowModal(true);
        }
    };

    const validateCurrentPassword = async () => {
        return currentPassword === userData.password;
    };

    const changePasswordInDatabase = async (newPassword) => {
        const updatedUserData = { ...userData, password: newPassword };
        try {
            const response = await fetch('http://localhost:5169/api/user/updateusercredentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUserData),
            });

            if (!response.ok) throw new Error('Failed to update password in the database.');

            return await response.json();
        } catch (error) {
            throw new Error("Failed to update password in the database.");
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!userData.userName || !userData.firstName || !userData.lastName) {
            setMessage("Please fill in all fields.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
        updateUserCredentials();
    };

    const isValidPassword = (password) => {
        return /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
    
        if (!currentPassword || !newPassword || !repeatedPassword) {
            setMessage("Please fill in all password fields.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
    
        if (currentPassword === newPassword) {
            setMessage("New password cannot be the same as the current password.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
    
        if (!isValidPassword(newPassword)) {
            setMessage("New password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
    
        if (newPassword !== repeatedPassword) {
            setMessage("New password and repeated password do not match.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
    
        const isCurrentPasswordValid = await validateCurrentPassword();
        if (!isCurrentPasswordValid) {
            setMessage("Current password is incorrect.");
            setMessageType('error');
            setShowModal(true);
            return;
        }
    
        try {
            await changePasswordInDatabase(newPassword);
            setMessage("Password changed successfully! Please log in again.");
            setMessageType('success');
            setShowModal(true);
    
            setUserData((prevState) => ({ ...prevState, password: newPassword }));
            localStorage.setItem('userData', JSON.stringify({ ...userData, password: newPassword }));
    
            localStorage.clear();
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
            setShowModal(true);
        }
    
        setCurrentPassword('');
        setNewPassword('');
        setRepeatedPassword('');
    };
    
    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div className="logo ms-3" onClick={() => navigate('/main')} style={{ cursor: 'pointer' }}>
                    <img src="/path/to/logo.png" alt="Logo" style={{ height: '60px' }} />
                </div>
            </header>
            <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
                <div className="card shadow-lg" style={{ width: '400px' }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4">Edit Profile</h2>

                        <form onSubmit={handleSave}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    value={userData.userName}
                                    onChange={(e) => setUserData({ ...userData, userName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="firstName"
                                    value={userData.firstName}
                                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="lastName"
                                    value={userData.lastName}
                                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="dateOfBirth"
                                    value={userData.dateOfBirth.split('T')[0]}
                                    onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="address" className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="address"
                                    value={userData.address}
                                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-warning w-100 mb-3">Save Changes</button>
                        </form>

                        <h3 className="text-center mt-4">Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="newPassword" className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="repeatedPassword" className="form-label">Repeat New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="repeatedPassword"
                                    value={repeatedPassword}
                                    onChange={(e) => setRepeatedPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-warning w-100 mb-3">Change Password</button>
                        </form>

                        <button className="btn btn-secondary w-100" onClick={() => navigate('/profile')}>
                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{messageType === 'success' ? 'Success' : 'Error'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className={messageType === 'success' ? 'text-success' : 'text-danger'}>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditProfile;
