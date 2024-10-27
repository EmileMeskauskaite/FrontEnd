import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// Sample component for stock graph
const StockGraph = ({ stockData }) => {
    return <div>Graph Placeholder</div>; // Replace with actual graph logic
};

const MyPortfolio = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Example user data from location state or hardcoded
    const userData = location.state?.userData || { username: 'Investor' }; 

    // Sample data for wallet and investments
    const [wallet, setWallet] = useState({
        availableFunds: 5000,
        totalPortfolioValue: 30000,
    });

    const investments = [
        { companyName: 'Company A', shares: 10, value: 1000 },
        { companyName: 'Company B', shares: 5, value: 500 },
    ]; // Example investments data
    
    const marketData = [
        { companyName: 'Market A', stockIndex: '+2.5%', stockData: [] },
        { companyName: 'Market B', stockIndex: '-1.2%', stockData: [] },
    ]; // Example market data

    const hasMore = true; // Example boolean for "Load More"

    useEffect(() => {
        // You can fetch wallet data or perform other effects
    }, []);

    const loadMoreCompanies = () => {
        // Logic for loading more companies
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main')} // Redirect to the main page on click
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
                            <button className="dropdown-item" onClick={() => navigate('/my-portfolio')}>My Portfolio</button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/purchases')}>Purchases History</button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/sales')}>Sales History</button>
                        </li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={() => navigate('/')}>Sign Out</button>
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
            </main>
        </div>
    );
};

export default MyPortfolio;
