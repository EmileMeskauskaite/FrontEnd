import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const SellStockPage = () => {
    const { stockName } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState(location.state?.companyName || stockName);

    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    const [quantity, setQuantity] = useState(0);
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [ownedQuantity, setOwnedQuantity] = useState(0);
    const [currentTotalValue, setCurrentTotalValue] = useState(0); // Current total value
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [remainingTime, setRemainingTime] = useState(180); // 3 minutes in seconds

    const latestPrice = parseFloat(location.state?.latestPrice || 0);

    useEffect(() => {
        if (location.state?.companyName) {
            setCompanyName(location.state.companyName);
        }

        fetchUserProfile();

        // Countdown timer and timeout logic
        const intervalId = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    setShowTimeoutModal(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [stockName, location.state]);

    const fetchUserProfile = async () => {
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
                throw new Error("Failed to fetch user profile.");
            }

            const data = await response.json();
            setBalance(data.balance || 0);

            // Check if the user owns the stock
            const ownedStock = data.userPortfolioStocks?.find(
                (stock) => stock.company.id === stockName
            );
            setOwnedQuantity(ownedStock?.quantity || 0);

            // Update current total value
            setCurrentTotalValue((ownedStock?.quantity || 0) * latestPrice);
        } catch (error) {
            console.error("Error fetching user profile:", error.message);
            setError("Failed to fetch user data. Please refresh the page.");
        }
    };

    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        if (value < 0) {
            setError("Amount cannot be negative.");
        } else if (value / latestPrice > ownedQuantity) {
            setError("You cannot sell more stocks than you own.");
        } else {
            setAmount(value || 0);
            setQuantity(value / latestPrice);
            setError(null);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseFloat(e.target.value);
        if (value < 0) {
            setError("Quantity cannot be negative.");
        } else if (value > ownedQuantity) {
            setError("You cannot sell more stocks than you own.");
        } else {
            setQuantity(value || 0);
            setAmount(value * latestPrice);
            setError(null);
        }
    };

    const handleSell = async () => {
        if (amount <= 0 || quantity <= 0) {
            setError("Please enter a valid amount or quantity.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5169/api/userprofile/sell?id=${userData.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    symbol: stockName,
                    value: amount,
                    deviatedPrice: latestPrice,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to sell stock: ${response.status}`);
            }

            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error selling stock:", err.message);
            setError("Failed to complete the transaction. Please try again.");
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        navigate(`/stock/${stockName}`, { state: { latestPrice } });
    };

    const handleCloseTimeoutModal = () => {
        setShowTimeoutModal(false);
        navigate(`/stock/${stockName}`, { state: { latestPrice } });
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
                    onClick={() => navigate('/main', { state: { userData } })}
                />
                <h1 className="h2 ms-3 mb-0 text-white">Sell Stock: {companyName}</h1>
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

            {/* Timer */}
            <div className="text-end text-red pe-3 pt-2" style={{ position: 'absolute', top: 80, right: 0 }}>
                <strong>Sale Expires In: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</strong>
            </div>

            <main className="container py-5">
                {/* Wealth Overview */}
                <section className="mb-5">
                    <h3 className="text-center mb-4">Your Wealth</h3>
                    <div className="row">
                        {/* Money Left in Wallet */}
                        <div className="col-md-6">
                            <div className="card text-white semi-transparent-card mb-3 shadow-lg">
                                <div className="card-header text-center">
                                    <h5 className="mb-0">Money Left in Wallet</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-4 text-center">
                                        <h6>Available Balance</h6>
                                        <h3 className="card-title">
                                            ${balance.toFixed(2)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Overview */}
                        <div className="col-md-6">
                            <div className="card text-white custom-peach-color mb-3 shadow-lg">
                                <div className="card-header text-center">
                                    <h5 className="mb-0">{companyName} Overview</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-4 text-center">
                                        <h6>Stocks Owned</h6>
                                        <h3 className="card-title">
                                            {ownedQuantity}
                                        </h3>
                                    </div>
                                    <hr className="bg-light" />
                                    <div className="text-center">
                                        <h6>Current Total Value</h6>
                                        <h3 className="card-title">
                                            ${currentTotalValue.toFixed(2)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            <h3 className="text-center mb-4">Sell Stocks Form</h3>
                {/* Sell Form */}
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h4 className="card-title text-center">{companyName}</h4>
                                <p className="card-text">
                                    <strong>Current Price:</strong> ${latestPrice.toFixed(2)}
                                </p>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="quantity" className="form-label">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="form-control"
                                            id="quantity"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="amount" className="form-label">
                                            Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="form-control"
                                            id="amount"
                                            value={amount}
                                            onChange={handleAmountChange}
                                        />
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger text-center">{error}</div>
                                    )}
                                    <div className="d-grid">
                                        <button
                                            type="button"
                                            className="btn custom-btn"
                                            onClick={handleSell}
                                        >
                                            Sell Stock
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Success</h5>
                                </div>
                                <div className="modal-body">
                                    <p>Stock Sold. Check Transaction Page For More Information.</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn custom-btn"
                                        onClick={handleCloseSuccessModal}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Timeout Modal */}
            {showTimeoutModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Session Timeout</h5>
                                </div>
                                <div className="modal-body">
                                    <p>The fixed price time limit has been reached.</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn custom-btn"
                                        onClick={handleCloseTimeoutModal}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SellStockPage;
