import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Import your custom styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const ProfilePage = () => {
    const navigate = useNavigate();

    // State to hold user information
    const [username, setUsername] = useState('Investor');
    const [email, setEmail] = useState('investor@example.com');
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body">
                    <h2 className="text-center mb-4">Profile Information</h2>
                    <div className="mb-3">
                        <strong>Username:</strong> <span>{username}</span>
                    </div>
                    <div className="mb-3">
                        <strong>Email:</strong> <span>{email}</span>
                    </div>
                    <div className="mb-3">
                        <strong>First Name:</strong> <span>{firstName}</span>
                    </div>
                    <div className="mb-3">
                        <strong>Last Name:</strong> <span>{lastName}</span>
                    </div>
                    
                    <button 
                        className="btn btn-primary w-100 mb-3" 
                        onClick={() => navigate('/edit-profile')}
                    >
                        Edit Profile
                    </button>
                    
                    <button 
                        className="btn btn-secondary w-100" 
                        onClick={() => navigate('/main')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
