import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [difficultylevel, setDifficultylevel] = useState(null); // Use state for difficulty level

    useEffect(() => {
        if (userData && userData.id) {
            fetchUserProfile(userData.id); 
            //console.log(userData);
        } else {
            console.error("id is undefined, cannot fetch user profile.");
        }
    }, [userData]);

    const fetchUserProfile = async (id) => {
        try {
            const response = await fetch(`http://localhost:5169/api/userprofile/getuserprofile?id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({}),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }
            
            const data = await response.json();
            //console.log(data.simulationLevel);
    
            // Update the state with the difficulty level
            setDifficultylevel(data.simulationLevel);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Could not fetch user profile. Please try again later.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/', { state: { logout: true } });
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main')} 
                    style={{ cursor: 'pointer' }}
                >
                    <img src="/baltaslogo.png" alt="Logo" style={{ height: '60px' }} />
                </div>
                <div className="dropdown me-3">
                    <button
                        className="btn btn-success btn-lg dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        My Account
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                        <li><button className="dropdown-item" onClick={() => navigate('/profile', { state: { userData } })}>Edit Profile</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/my-portfolio', { state: { userData } })}>My Portfolio</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/purchases')}>Purchases History</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/sales')}>Sales History</button></li>
                        <li><button className="dropdown-item text-danger" onClick={handleLogout}>Sign Out</button></li>
                    </ul>
                </div>
            </header>
            <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
                <div className="card shadow-lg" style={{ width: '400px' }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4">Profile Information</h2>
                        <div className="mb-3">
                            <strong>Username:</strong> <span>{userData?.userName}</span>
                        </div>
                        <div className="mb-3">
                            <strong>First Name:</strong> <span>{userData?.firstName}</span>
                        </div>
                        <div className="mb-3">
                            <strong>Last Name:</strong> <span>{userData?.lastName}</span>
                        </div>
                        <div className="mb-3">
                            <strong>Difficulty:</strong> <span>{difficultylevel !== null ? difficultylevel : 'Loading...'}</span>
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
