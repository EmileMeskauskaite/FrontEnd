import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const StockGraph = ({ stockData }) => {
    return <div>Graph Placeholder</div>; // Replace with actual graph logic
};

const MyPortfolio = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Access userData either from location state or localStorage
    const userData = location.state?.userData || JSON.parse(localStorage.getItem('userData'));

    // State for wallet and market data
    const [wallet, setWallet] = useState({
        availableFunds: 0,
        totalPortfolioValue: 0,
    });

    const [investments, setInvestments] = useState([]);
    const [marketData, setMarketData] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (userData) {
            fetchUserProfile(userData.userName);
        } else {
            console.error("User data is not available, redirecting to login.");
            navigate('/'); // Redirect to login if user data is missing
        }
    }, [userData, navigate]);

    const fetchUserProfile = async (username) => {
        try {
            const response = await fetch(`http://localhost:5169/api/userprofile/getuserprofile?userName=${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            const data = await response.json();
            setWallet({
                availableFunds: data.balance,
                totalPortfolioValue: data.totalPortfolioValue || 30000,
            });
            setInvestments(data.investments || []);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Could not fetch user profile. Please try again later.");
        }
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main', { state: { userData } })} // Pass userData when navigating to main page
                />
                <div className="dropdown">
                    <button
                        className="btn btn-success btn-lg me-4 dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        My Account
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/edit-profile', { state: { userData } })}>
                                Edit Profile
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/my-portfolio', { state: { userData } })}>My Portfolio</button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/purchases', { state: { userData } })}>Purchases History</button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/sales', { state: { userData } })}>Sales History</button>
                        </li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={() => {
                                localStorage.removeItem('userData'); // Clear localStorage on sign out
                                navigate('/');
                            }}>Sign Out</button>
                        </li>
                    </ul>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-5">
                {/* Wallet and Portfolio Overview */}
                <section className="mb-5">
                    <h2 className="text-center mb-4">Your Wallet & Portfolio Overview</h2>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card text-white bg-success mb-3 shadow-lg">
                                <div className="card-header">Money Left in Wallet</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.availableFunds}</h3>
                                    <p className="card-text">Your current available funds</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card text-white bg-warning mb-3 shadow-lg">
                                <div className="card-header">Current Portfolio Value</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.totalPortfolioValue}</h3>
                                    <p className="card-text">Your current portfolio worth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-5">
                    <h2 className="text-center mb-4">Your Investments</h2>
                    <div className="row">
                        {investments.map((investment, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{investment.companyName}</h5>
                                        <p className="card-text">Shares: {investment.shares}</p>
                                        <p className="card-text">Total Value: ${investment.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MyPortfolio;
