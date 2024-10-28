import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Placeholder for a graph component (like Chart.js or Recharts)
const StockGraph = ({ stockData }) => {
    return (
        <div className="stock-graph">
            <p>Graph for {stockData.companyName}</p>
        </div>
    );
};

const MainPage = () => {
    const navigate = useNavigate();

    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [wallet, setWallet] = useState({
        availableFunds: userData?.balance || 0, // Ensure fallback to 0 if balance is undefined
        totalPortfolioValue: 30000, // Placeholder for total portfolio value
    });

    const [investments, setInvestments] = useState([
        { companyName: 'Apple Inc.', shares: 10, value: 1500 },
        { companyName: 'Tesla Inc.', shares: 5, value: 3000 },
        { companyName: 'Amazon.com, Inc.', shares: 2, value: 4000 },
    ]);

    const [marketData, setMarketData] = useState([]);
    const [visibleCompanies, setVisibleCompanies] = useState(3);
    const [hasMore, setHasMore] = useState(true);

    // Fetch user profile and market data on component mount
    useEffect(() => {
        if (userData && userData.userName) {
            fetchUserProfile(userData.userName); // Use userName instead of username
        } else {
            console.error("Username is undefined, cannot fetch user profile.");
        }
        fetchMarketData(); // Fetch market data independently
    }, [userData]);

    // Adjusted fetchUserProfile to use POST
    const fetchUserProfile = async (userName) => {
        try {
            const response = await fetch(`http://localhost:5169/api/userprofile/getuserprofile?userName=${userName}`, {
                method: 'POST', // Changed to POST
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json', // Ensure we accept JSON responses
                },
                body: JSON.stringify({}), // POST requests typically require a body
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            const data = await response.json();
            // Assuming data contains user information and balance
            setWallet((prevWallet) => ({
                ...prevWallet,
                availableFunds: data.balance || 0, // Update with the fetched balance
            }));
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Could not fetch user profile. Please try again later.");
        }
    };

    const fetchMarketData = () => {
        // Mock API call for market data (replace with actual API)
        const initialMarketData = [
            { companyName: 'Apple Inc.', stockIndex: '+2.5%', stockData: [] },
            { companyName: 'Tesla Inc.', stockIndex: '-1.8%', stockData: [] },
            { companyName: 'Amazon.com, Inc.', stockIndex: '+1.2%', stockData: [] },
            { companyName: 'Microsoft Corp.', stockIndex: '+3.1%', stockData: [] },
            { companyName: 'Netflix Inc.', stockIndex: '-0.7%', stockData: [] },
        ];

        // Simulate delay from API
        setTimeout(() => {
            setMarketData(initialMarketData.slice(0, visibleCompanies));
            setHasMore(initialMarketData.length > visibleCompanies);
        }, 500);
    };

    const loadMoreCompanies = () => {
        const nextVisible = visibleCompanies + 3; // Load 3 more companies each time
        setVisibleCompanies(nextVisible);
        fetchMarketData(); // Fetch and update visible companies
    };

    const handleLogout = () => {
        localStorage.removeItem('userData'); // Clear user data from localStorage on logout
        navigate('/', { state: { logout: true } });
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <h1 className="h4 ms-3 mb-0">Welcome, {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}!</h1>
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
                            <button className="dropdown-item" onClick={() => navigate('/profile', { state: { userData } })}>
                                Edit Profile
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/my-portfolio', { state: { userData } })}>
                                My Portfolio
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/purchases')}>Purchases History</button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/sales')}>Sales History</button>
                        </li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>Sign Out</button>
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
                        {/* Money Left in Wallet */}
                        <div className="col-md-6">
                            <div className="card text-white bg-success mb-3 shadow-lg">
                                <div className="card-header">Money Left in Wallet</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.availableFunds.toFixed(2)}</h3>
                                    <p className="card-text">Your current available funds</p>
                                </div>
                            </div>
                        </div>

                        {/* Current Portfolio Value */}
                        <div className="col-md-6">
                            <div className="card text-white bg-warning mb-3 shadow-lg">
                                <div className="card-header">Current Portfolio Value</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.totalPortfolioValue.toFixed(2)}</h3>
                                    <p className="card-text">Your current portfolio worth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Investments */}
                <section className="mb-5">
                    <h2 className="text-center mb-4">Your Investments</h2>
                    <div className="row">
                        {investments.map((investment, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{investment.companyName}</h5>
                                        <p className="card-text">Shares: {investment.shares}</p>
                                        <p className="card-text">Total Value: ${investment.value.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Market Trends with "Load More" */}
                <section className="mb-5">
                    <h2 className="text-center mb-4">Market Trends</h2>
                    <div className="row">
                        {marketData.map((stock, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{stock.companyName}</h5>
                                        <p className="card-text">Stock Index: {stock.stockIndex}</p>
                                        <StockGraph stockData={stock} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {hasMore && (
                        <div className="text-center mt-4">
                            <button className="btn btn-primary" onClick={loadMoreCompanies}>
                                Load More Companies
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MainPage;
