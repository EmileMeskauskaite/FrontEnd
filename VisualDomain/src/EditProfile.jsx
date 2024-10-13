import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Import your custom styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const EditProfile = () => {
    const navigate = useNavigate();

    // State to hold user information
    const [username, setUsername] = useState('Investor');
    const [email, setEmail] = useState('investor@example.com');
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Handler to save changes
    const handleSave = (e) => {
        e.preventDefault();

        // Basic validation
        if (!username || !email || !firstName || !lastName) {
            alert("Please fill in all fields.");
            return;
        }

        // You can add your API call here to save changes

        alert(`Profile updated:\nUsername: ${username}\nEmail: ${email}\nFirst Name: ${firstName}\nLast Name: ${lastName}`);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();

        // Basic validation
        if (!currentPassword || !newPassword) {
            alert("Please fill in all password fields.");
            return;
        }

        // Placeholder for password change logic
        alert(`Password changed successfully!`);
        setCurrentPassword(''); // Reset the password fields after change
        setNewPassword('');
    };

    return (
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
    );
};

export default EditProfile;
