import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Import your custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from Bootstrap

const EditProfile = () => {
    const navigate = useNavigate();

    // State to hold user information
    const [username, setUsername] = useState('Investor');
    const [email, setEmail] = useState('investor@example.com');
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatedPassword, setRepeatedPassword] = useState('');

    // State to handle success/error messages
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [showModal, setShowModal] = useState(false);  // State to control modal visibility

    // Function to close the modal
    const handleClose = () => setShowModal(false);

    // Handler to save changes
    const handleSave = (e) => {
        e.preventDefault();

        // Basic validation
        if (!username || !email || !firstName || !lastName) {
            setMessage("Please fill in all fields.");
            setMessageType('error');
            setShowModal(true); // Show the popup
            return;
        }

        // You can add your API call here to save changes

        setMessage(`Profile updated successfully!`);
        setMessageType('success');
        setShowModal(true); // Show the popup
    };

    const isValidPassword = (password) => {
        // Check password criteria
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasMinimumLength = password.length >= 8;

        return hasUpperCase && hasNumber && hasMinimumLength;
    };

    const handleChangePassword = (e) => {
        e.preventDefault();

        // Check if both password fields are filled
        if (!currentPassword || !newPassword || !repeatedPassword) {
            setMessage("Please fill in all password fields.");
            setMessageType('error');
            setShowModal(true); // Show the popup
            return;
        }

        // Check if the current password and new password are the same
        if (currentPassword === newPassword) {
            setMessage("New password cannot be the same as the current password.");
            setMessageType('error');
            setShowModal(true); // Show the popup
            return;
        }

        // Validate the new password
        if (!isValidPassword(newPassword)) {
            setMessage("New password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.");
            setMessageType('error');
            setShowModal(true); // Show the popup
            return;
        }

        // Check if the new password and repeated password match
        if (newPassword !== repeatedPassword) {
            setMessage("New password and repeated password do not match.");
            setMessageType('error');
            setShowModal(true); // Show the popup
            return;
        }

        // Placeholder for password change logic
        setMessage("Password changed successfully!");
        setMessageType('success');
        setShowModal(true); // Show the popup
        setCurrentPassword(''); // Reset the password fields after change
        setNewPassword('');
        setRepeatedPassword('');
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main')} // Redirect to the main page on click
                />
                
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
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">Save Changes</button>
                    </form>
                    
                    <h3 className="text-center mb-4">Change Password</h3>
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

                    <button 
                        className="btn btn-secondary w-100" 
                        onClick={() => navigate('/profile')}
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
            </div>

            {/* Modal for Success/Error messages */}
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
