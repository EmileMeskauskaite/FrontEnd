import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const MyPortfolio = () => {
    const navigate = useNavigate();

    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [portfolioStocks, setPortfolioStocks] = useState([]);
    const [wallet, setWallet] = useState({
        availableFunds: userData?.balance || 0,
        totalPortfolioValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userData?.id) {
            fetchPortfolio(userData.id);
        } else {
            setError("User data not available. Please log in.");
            setLoading(false);
        }
    }, [userData]);

    const fetchPortfolio = async (userId) => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/userprofile/getuserprofile?id=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch portfolio: ${response.status}`);
            }

            const data = await response.json();

            // Calculate total portfolio value
            const totalPortfolioValue = data.userPortfolioStocks
                ? data.userPortfolioStocks.reduce(
                      (sum, stock) => sum + (stock.currentTotalValue || 0),
                      0
                  )
                : 0;

            setWallet({
                availableFunds: data.balance || 0,
                totalPortfolioValue,
            });

            setPortfolioStocks(data.userPortfolioStocks || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/');
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
            <div 
                className="logo ms-3" 
                onClick={() => navigate('/main', { state: { userData } })} // Pass userData when navigating to main page
            />
                <h1 className="h2 ms-3 mb-0 text-white">
                    My Portfolio
                </h1>

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
                    <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby="dropdownMenuButton"
                    >
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

            <main className="container py-5">
                <section className="mb-5">
                    <h2 className="text-center mb-4">My Wallet & Portfolio Overview</h2>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card text-white semi-transparent-card mb-3 shadow-lg">
                                <div className="card-header">Money Left in Wallet</div>
                                <div className="card-body">
                                    <h3 className="card-title">
                                        ${wallet.availableFunds.toFixed(2)}
                                    </h3>
                                    <p className="card-text">My current available funds</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card text-white custom-peach-color mb-3 shadow-lg">
                                <div className="card-header">Current Portfolio Value</div>
                                <div className="card-body">
                                    <h3 className="card-title">
                                        ${wallet.totalPortfolioValue.toFixed(2)}
                                    </h3>
                                    <p className="card-text">My current portfolio worth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <h3 className="text-center mb-4">My Investments</h3>

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : portfolioStocks.length > 0 ? (
                    <div className="row">
                        {portfolioStocks.map((stock) => (
                            <div
                            key={stock.id}
                            className="col-md-4 mb-4"
                            onClick={() => navigate(`/stock/${stock.company.id}`, { state: { stock } })}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card shadow-lg">
                                <div className="card-header custom-peach-color text-white">
                                    <h5 className="card-title mb-0">
                                        {stock.company?.name || 'Unknown Company'}
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">
                                        <strong>Quantity:</strong> {stock.quantity}
                                    </p>
                                    <p className="card-text">
                                        <strong>Total Base Value:</strong> $
                                        {stock.totalBaseValue.toFixed(2)}
                                    </p>
                                    <p className="card-text">
                                        <strong>Current Total Value:</strong> $
                                        {stock.currentTotalValue.toFixed(2)}
                                    </p>
                                    <p className="card-text">
                                        <strong>Percentage Change:</strong>{' '}
                                        {stock.percentageChange.toFixed(2)}%
                                    </p>
                                    <p className="card-text">
                                        <strong>Last Updated:</strong>{' '}
                                        {new Date(stock.lastUpdated).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info text-center">
                        You don't have any stocks in your portfolio.
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyPortfolio;
