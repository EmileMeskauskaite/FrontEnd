import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const StockPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const stock = location.state?.stock;

    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [currentStock, setCurrentStock] = useState(stock); // Use state for stock
    const [flashClass, setFlashClass] = useState(''); // Track flash class for styling

    useEffect(() => {
        if (currentStock) {
            const intervalId = generateStockUpdates();
            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [currentStock]);

    const generateStockUpdates = () => {
        return setInterval(() => {
            setCurrentStock((prevStock) => {
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
        navigate('/', { state: { logout: true } });
    };

    if (!stock) {
        return (
            <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center investment-background">
                <h1 className="text-danger">Stock not found</h1>
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
                <h1 className="h4 ms-3 mb-0 text-white">
                    Stocks
                </h1>
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
                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/transactions', { state: { userData } })}
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
                                <h4 className="m-0 text-center">{currentStock.companyName}</h4>
                            </div>
                            <div className="card-body">
                                <p className={`card-text ${flashClass}`}>
                                    <strong>Stock Index:</strong> {currentStock.stockIndex}
                                </p>
                                <p className="card-text">
                                    <strong>Stock ID:</strong> {currentStock.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center my-2">
                    <div className="col-md-3 d-grid">
                        <button className="custom-btn mb-3 shadow-lg" onClick={() => navigate('/buy-stock', { state: { stock: currentStock } })}>
                            Buy Stock
                        </button>
                    </div>
                    <div className="col-md-3 d-grid mt-3 mt-md-0">
                        <button className="custom-btn-danger mb-3 shadow-lg" onClick={() => navigate('/sell-stock', { state: { stock: currentStock } })}>
                            Sell Stock
                        </button>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg">
                            <div className="card-header semi-transparent-card text-white d-flex justify-content-center align-items-center">
                                <h5 className="text-center m-0">Historical Data</h5>
                            </div>

                            <div className="card-body">
                                {stock.stockData.length > 0 ? (
                                    <ul className="list-group">
                                        {stock.stockData.map((dataPoint, index) => (
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
