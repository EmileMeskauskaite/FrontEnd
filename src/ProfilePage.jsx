import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [startingMoney, setStartingMoney] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [difficultylevel, setDifficultylevel] = useState(null); // Use state for difficulty level

    useEffect(() => {
        if (userData && userData.id) {
            fetchUserProfile(userData.id);
            
        } else {
            console.error("ID is undefined, cannot fetch user profile.");
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
            setDifficultylevel(data.simulationLevel);
            console.log('User data:', userData);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Could not fetch user profile. Please try again later.");
        }
    };

    const handleRestartProfile = async () => {
        try {
            if (difficulty === null) {
                alert("Please select a difficulty level.");
                return;
            }
            const response = await fetch(
                `http://localhost:5169/api/userprofile/resetprofile?id=${userData.id}&difficulty=${difficulty}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            if (response.ok) {
                alert("Profile successfully restarted.");
                fetchUserProfile(userData.id);
            } else {
                console.error(`Failed to restart profile: ${response.status}`);
            }
        } catch (error) {
            console.error("Error restarting profile:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/', { state: { logout: true } });
    };

    /*istanbul ignore next */
    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div
                    className="logo ms-3"
                    onClick={() => navigate('/main', { state: { userData } })}
                />
                <h1 className="h2 ms-3 mb-0 text-white">My Profile</h1>
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
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/profile', { state: { userData } })}
                            >
                                Edit Profile
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/my-portfolio', { state: { userData } })}
                            >
                                My Portfolio
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/transactions', { state: { userData } })}
                            >
                                My Transactions
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item text-danger"
                                onClick={handleLogout}
                            >
                                Sign Out
                            </button>
                        </li>
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
                        <div className="mb-3" data-testid="loading-spinner">
                            <strong>Difficulty:</strong> <span>{difficultylevel !== null ? difficultylevel : 'Loading...'}</span>
                        </div>

                        <button
                            className="btn btn-primary w-100 mb-3"
                            onClick={() => navigate('/edit-profile')}
                        >
                            Edit Profile
                        </button>
                        <button
                            className="btn btn-secondary w-100 mb-4"
                            onClick={() => navigate('/main')}
                        >
                            Back to Dashboard
                        </button>

                        {/* Restart Profile Section */}
                        <div>
                            <h4 className="text-black mb-3">Restart Profile</h4>
                            <label className="form-label text-black">Choose Starting Money</label>
                            <div className="button-group mb-3">
                                <button
                                    type="button"
                                    className={`custom-btn ${startingMoney === 10000 ? 'selected' : ''}`}
                                    onClick={() => {
                                        setStartingMoney(10000);
                                        setDifficulty('0');
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
                            <button
                                className="btn btn-dark w-100"
                                onClick={handleRestartProfile}
                                disabled={difficulty === null}
                            >
                                Restart Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
