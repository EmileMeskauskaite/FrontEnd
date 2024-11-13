import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const StockGraph = ({ stockData }) => {
    return (
        <div className="stock-graph">
            <p>Graph for {stockData.companyName}</p>
        </div>
    );
};

const MainPage = () => {
    const navigate = useNavigate();

    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [wallet, setWallet] = useState({
        availableFunds: userData?.balance || 0, 
        totalPortfolioValue: 30000, 
    });

    const [investments, setInvestments] = useState([
        { companyName: 'Apple Inc.', shares: 10, value: 1500 },
        { companyName: 'Tesla Inc.', shares: 5, value: 3000 },
        { companyName: 'Amazon.com, Inc.', shares: 2, value: 4000 },
    ]);

    const [marketData, setMarketData] = useState([]);
    const [visibleCompanies, setVisibleCompanies] = useState(3);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (userData && userData.id) {
            fetchUserProfile(userData.id); 
        } else {
            console.error("id is undefined, cannot fetch user profile.");
        }
        fetchMarketData();
    }, [userData]);

    const fetchUserProfile = async (id) => {
    {
            const response = await fetch(`http://localhost:5169/api/userprofile/getuserprofile?id=${userData.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json', 
                },
                body: JSON.stringify({}), 
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            const data = await response.json();
            setWallet((prevWallet) => ({
                ...prevWallet,
                availableFunds: data.balance || 0, 
            }));
    }
    };

    const fetchMarketData = async () => {
        try {
            // Step 1: Fetch the list of all companies
            const response = await fetch('http://localhost:5169/api/marketdata/getallcompanies');
            
            if (response.ok) {
                const data = await response.json();
                
                // Step 2: Transform the initial data and prepare to fetch live prices for each company
                const fullMarketDataPromises = data.map(async (company) => {
                    try {
                        // Fetch live price data for each company using its id
                        const priceResponse = await fetch(`http://localhost:5169/api/marketdata/marketdata/getcompanylivepricedistinct?symbols=${company.id}`);
                        
                        if (priceResponse.ok) {
                            const priceData = await priceResponse.json();
                            
                            // Assume the latest price is the first entry, or adjust as needed
                            const latestPrice = priceData.length > 0 ? priceData[0].price : 'N/A';
                            
                            // Return the company data combined with the latest price and price history
                            return {
                                companyName: company.name,
                                stockIndex: latestPrice, // Latest live price
                                stockData: priceData     // Full price history data
                            };
                        } else {
                            console.error(`Failed to fetch live price data for ${company.name}`);
                            return {
                                companyName: company.name,
                                stockIndex: 'N/A',  // Default if live price fetch fails
                                stockData: []
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching live price for ${company.name}:`, error);
                        return {
                            companyName: company.name,
                            stockIndex: 'N/A',
                            stockData: []
                        };
                    }
                });
    
                // Step 3: Wait for all live price data fetches to complete
                const fullMarketData = await Promise.all(fullMarketDataPromises);
    
                // Update state with the combined data, limited by `visibleCompanies`
                setMarketData(fullMarketData.slice(0, visibleCompanies));
                setHasMore(fullMarketData.length > visibleCompanies);
            } else if (response.status === 204) {
                // Handle case with no content
                setMarketData([]);
                setHasMore(false);
            } else {
                console.error("Failed to fetch market data. Status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };
    

    const loadMoreCompanies = () => {
        const nextVisible = visibleCompanies + 9;
        setVisibleCompanies(nextVisible);
        fetchMarketData();
    };

    const handleLogout = () => {
        localStorage.removeItem('userData'); 
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
