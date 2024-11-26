import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const StockPage = () => {
    const { stockName } = useParams(); // Get stock ID from the URL
    const navigate = useNavigate(); // Ensure navigate is defined
    const location = useLocation(); // For accessing passed state

    const [stockData, setStockData] = useState(null); // Holds stock data
    const [companyName, setCompanyName] = useState(location.state?.companyName || stockName);
    const [userStocks, setUserStocks] = useState(null); // User's stock information
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flashClass, setFlashClass] = useState(''); // Flash effect for price changes

    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    useEffect(() => {
        if (location.state?.companyName) {
            setCompanyName(location.state.companyName); // Update company name if passed via state
        }
        fetchStockData(stockName); // Fetch stock data using stock ID
        fetchUserStocks(); // Fetch user's stock information
    }, [stockName]);

    useEffect(() => {
        if (stockData) {
            const intervalId = generateStockUpdates();
            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [stockData]);

    const fetchStockData = async (symbol) => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/marketdata/marketdata/getcompanylivepricedistinct?symbols=${symbol}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch stock data: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                throw new Error("API response is empty.");
            }

            const data = JSON.parse(text);

            if (!data || data.length === 0) {
                throw new Error(`No stock data available for symbol: ${symbol}`);
            }

            const latestStock = data[0]; // Assume API returns an array
            setStockData({
                companyName: symbol,
                stockIndex: latestStock.price,
                stockData: data,
            });
        } catch (err) {
            console.error("Error fetching stock data:", err.message);
            setError(err.message); // Display error to the user
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStocks = async () => {
        if (!userData?.id) return;

        try {
            const response = await fetch(
                `http://localhost:5169/api/userprofile/getuserprofile?id=${userData.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch user stocks: ${response.status}`);
            }

            const data = await response.json();
            const ownedStock = data.userPortfolioStocks?.find(
                (stock) => stock.company.id === stockName
            );
            setUserStocks(ownedStock || null);
        } catch (err) {
            console.error("Error fetching user stocks:", err.message);
        }
    };

    const generateStockUpdates = () => {
        return setInterval(() => {
            setStockData((prevStock) => {
                if (!prevStock) return prevStock;

                const change = (Math.random() * 0.2 - 0.1).toFixed(2); // Random +/- 0.1
                const newPrice = Math.max(
                    0,
                    parseFloat(prevStock.stockIndex) + parseFloat(change)
                );

                // Trigger flash effect based on price change
                setFlashClass(parseFloat(change) > 0 ? 'stock-green' : 'stock-red');
                setTimeout(() => setFlashClass(''), 2000); // Reset flash class after 2 seconds

                return {
                    ...prevStock,
                    stockIndex: newPrice.toFixed(2),
                };
            });
        }, Math.random() * (10000 - 5000) + 5000); // Random interval between 5-10 seconds
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center investment-background">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !stockData) {
        return (
            <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center investment-background">
                <h1 className="text-danger">Error: {error || "Stock not found"}</h1>
                <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid vh-100 p-0">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main', { state: { userData } })}
                />
                <h1 className="h2 ms-3 mb-0 text-white">Stock: {companyName}</h1>
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
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                Edit Profile
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => navigate('/my-portfolio')}>
                                My Portfolio
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/transactions')}
                            >
                                My Transactions
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </div>
            </header>

            <main className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card semi-transparent-card shadow-lg mb-4">
                            <div className="card-header centered-card-header">
                                <h4 className="m-0 text-center">{companyName}</h4>
                            </div>
                            <div className="card-body">
                                <p className={`card-text ${flashClass}`}>
                                    <strong>Stock Index:</strong> ${stockData.stockIndex}
                                </p>
                                <p className="card-text">
                                    <strong>Stock Symbol:</strong> {stockData.companyName}
                                </p>
                                {userStocks && (
                                    <p className="card-text">
                                        <strong>Owned Stocks:</strong> {userStocks.quantity}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center my-2">
                    <div className="col-md-3 d-grid">
                        <button
                            className="custom-btn mb-3 shadow-lg"
                            onClick={() => navigate(`/buy-stock/${stockName}`, { state: { stockId: stockName, latestPrice:stockData.stockIndex, companyName: companyName } })}
                        >
                            Buy Stock
                        </button>
                    </div>
                    {userStocks && (
                        <div className="col-md-3 d-grid mt-3 mt-md-0">
                            <button
                                className="custom-btn-danger mb-3 shadow-lg"
                                onClick={() => navigate(`/sell-stock/${stockName}`, { state: { stockId: stockName , latestPrice: stockData.stockIndex, companyName: companyName} })}
                            >
                                Sell Stock
                            </button>
                        </div>
                    )}
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg">
                            <div className="card-header semi-transparent-card text-white d-flex justify-content-center align-items-center">
                                <h5 className="text-center m-0">Historical Data</h5>
                            </div>
                            <div className="card-body">
                                {stockData.stockData.length > 0 ? (
                                    <ul className="list-group">
                                        {stockData.stockData.map((dataPoint, index) => (
                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>Date: {dataPoint.date}</span>
                                                <span>Price: ${dataPoint.price.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No historical data available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StockPage;
