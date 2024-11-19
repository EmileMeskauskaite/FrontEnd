import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const StockGraph = ({ stockData }) => (
    <div className="stock-graph">
        <p>Graph for {stockData.companyName}</p>
    </div>
);

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
    const [flashState, setFlashState] = useState({});
    const [visibleCompanies, setVisibleCompanies] = useState(3);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (userData?.id) {
            fetchUserProfile(userData.id);
        } else {
            console.error("User ID is undefined, cannot fetch user profile.");
        }
    }, [userData]);

    const fetchUserProfile = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/userprofile/getuserprofile?id=${id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        accept: 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            const data = await response.json();
            setWallet((prevWallet) => ({
                ...prevWallet,
                availableFunds: data.balance || 0,
            }));
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchMarketData = async () => {
        try {
            const response = await fetch(
                'http://localhost:5169/api/marketdata/getallcompanies'
            );

            if (response.ok) {
                const data = await response.json();

                const fullMarketDataPromises = data.map(async (company) => {
                    try {
                        const priceResponse = await fetch(
                            `http://localhost:5169/api/marketdata/marketdata/getcompanylivepricedistinct?symbols=${company.id}`
                        );

                        if (priceResponse.ok) {
                            const priceData = await priceResponse.json();
                            const latestPrice =
                                priceData.length > 0 ? priceData[0].price : 'N/A';

                            return {
                                id: company.id,
                                companyName: company.name,
                                stockIndex: latestPrice,
                                stockData: priceData,
                            };
                        } else {
                            console.error(
                                `Failed to fetch live price data for ${company.name}`
                            );
                            return {
                                id: company.id,
                                companyName: company.name,
                                stockIndex: 'N/A',
                                stockData: [],
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching live price for ${company.name}:`, error);
                        return {
                            id: company.id,
                            companyName: company.name,
                            stockIndex: 'N/A',
                            stockData: [],
                        };
                    }
                });

                const fullMarketData = await Promise.all(fullMarketDataPromises);
                setMarketData(fullMarketData.slice(0, visibleCompanies));
                setHasMore(fullMarketData.length > visibleCompanies);
            } else if (response.status === 204) {
                setMarketData([]);
                setHasMore(false);
            } else {
                console.error("Failed to fetch market data. Status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };

    useEffect(() => {
        fetchMarketData();

        const intervalId = setInterval(() => {
            setMarketData((prevData) =>
                prevData.map((stock) => {
                    if (Math.random() <= 0.4) { 
                        const change = (Math.random() * 0.2 - 0.1).toFixed(2); 
                        const newPrice = Math.max(0, parseFloat(stock.stockIndex) + parseFloat(change));

                        setFlashState((prevFlashState) => ({
                            ...prevFlashState,
                            [stock.id]: parseFloat(change) > 0 ? 'up' : 'down',
                        }));

                        setTimeout(() => {
                            setFlashState((prevFlashState) => ({
                                ...prevFlashState,
                                [stock.id]: null,
                            }));
                        }, 2000);

                        return { ...stock, stockIndex: newPrice.toFixed(2) };
                    }
                    return stock; 
                })
            );
        }, Math.random() * (10000 - 5000) + 5000); 

        return () => clearInterval(intervalId); 
    }, []);

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
            <header
                className="custom-header d-flex justify-content-between align-items-center shadow-sm"
                style={{ height: '80px' }}
            >
                <h1 className="h4 ms-3 mb-0">
                    Welcome, {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}!
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
                                onClick={() => navigate('/purchases')}
                            >
                                Purchases History
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/sales')}
                            >
                                Sales History
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
                    <h2 className="text-center mb-4">Your Wallet & Portfolio Overview</h2>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card text-white bg-success mb-3 shadow-lg">
                                <div className="card-header">Money Left in Wallet</div>
                                <div className="card-body">
                                    <h3 className="card-title">
                                        ${wallet.availableFunds.toFixed(2)}
                                    </h3>
                                    <p className="card-text">Your current available funds</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card text-white bg-warning mb-3 shadow-lg">
                                <div className="card-header">Current Portfolio Value</div>
                                <div className="card-body">
                                    <h3 className="card-title">
                                        ${wallet.totalPortfolioValue.toFixed(2)}
                                    </h3>
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
                                        <p className="card-text">
                                            Total Value: ${investment.value.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-5">
                    <h2 className="text-center mb-4">Market Trends</h2>
                    <div className="row">
                        {marketData.map((stock, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{stock.companyName}</h5>
                                        <p
                                            className={`card-text ${
                                                flashState[stock.id] === 'up'
                                                    ? 'text-danger fw-bold'
                                                    : flashState[stock.id] === 'down'
                                                    ? 'fw-bold stock-green'
                                                    : ''
                                            }`}
                                        >
                                            Stock Index: {stock.stockIndex}
                                        </p>
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
