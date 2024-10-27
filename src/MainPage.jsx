import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

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
    const location = useLocation();

    const [userData, setUserData] = useState({
        username: 'Investor',
        email: 'investor@example.com',
        firstName: 'John',
        lastName: 'Doe',
    });

    const [wallet, setWallet] = useState({
        availableFunds: 5000, 
        totalPortfolioValue: 30000, 
    });

    const [investments, setInvestments] = useState([
        {
            companyName: 'Apple Inc.',
            shares: 10,
            value: 1500,
        },
        {
            companyName: 'Tesla Inc.',
            shares: 5,
            value: 3000,
        },
        {
            companyName: 'Amazon.com, Inc.',
            shares: 2,
            value: 4000,
        },
    ]);

    const [marketData, setMarketData] = useState([]);
    const [visibleCompanies, setVisibleCompanies] = useState(3); // To manage visible companies
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Initial fetch for first set of market data
        fetchMarketData();
    }, []);

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
        // Navigate to the LoginPage with a logout state
        navigate('/', { state: { logout: true } });
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <h1 className="h4 ms-3 mb-0">Welcome, {userData.username}!</h1>
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
                            <button className="dropdown-item" onClick={() => navigate('/my-portfolio')}>My Portfolio</button>
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
                                    <h3 className="card-title">${wallet.availableFunds}</h3>
                                    <p className="card-text">Your current available funds</p>
                                </div>
                            </div>
                        </div>

                        {/* Current Portfolio Value */}
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
                                        <p className="card-text">Total Value: ${investment.value}</p>
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
                        {marketData.map((market, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{market.companyName}</h5>
                                        <p className="card-text">
                                            Stock Index: <span className={market.stockIndex.includes('+') ? 'text-success' : 'text-danger'}>
                                                {market.stockIndex}
                                            </span>
                                        </p>
                                        <StockGraph stockData={market.stockData} />
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
