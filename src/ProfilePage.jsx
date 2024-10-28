import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Import your custom styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const ProfilePage = () => {
    const navigate = useNavigate();

    // State to hold user information
    const [userData, setUserData] = useState({
        username: '',
        firstName: '',
        lastName: '',
    });

    // Fetch user data from localStorage on component mount
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            //console.log("Retrieved user data:", parsedUserData); // Debugging log
            setUserData({
                username: parsedUserData.userName || 'N/A', // Map userName to username
                firstName: parsedUserData.firstName || 'N/A',
                lastName: parsedUserData.lastName || 'N/A',
            });
        } else {
            console.error("User data not found in localStorage.");
        }
    }, []);

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main')} // Redirect to the main page on click
                    style={{ cursor: 'pointer' }} // Change cursor to pointer for better UX
                >
                    {/* Add a logo image or icon here, e.g., */}
                    <img src="/path/to/logo.png" alt="Logo" style={{ height: '60px' }} />
                </div>
            </header>
            <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
                <div className="card shadow-lg" style={{ width: '400px' }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4">Profile Information</h2>
                        <div className="mb-3">
                            <strong>Username:</strong> <span>{userData.username}</span>
                        </div>
                        <div className="mb-3">
                            <strong>First Name:</strong> <span>{userData.firstName}</span>
                        </div>
                        <div className="mb-3">
                            <strong>Last Name:</strong> <span>{userData.lastName}</span>
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
        </div>
    );
};

export default ProfilePage;
