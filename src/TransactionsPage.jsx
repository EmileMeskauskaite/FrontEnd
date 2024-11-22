import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'timeOfTransaction', direction: 'asc' }); // Default sorting config
    const navigate = useNavigate();

    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    useEffect(() => {
        if (userData && userData.id) {
            fetchTransactions(userData.id);
        } else {
            setError("User data not available. Please log in.");
            setLoading(false);
        }
    }, []);

    const fetchTransactions = async (userId) => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/userprofile/getuserprofile?id=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.status}`);
            }

            const data = await response.json();
            setTransactions(data.userTransactions || []);
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

    const handleBackToDashboard = () => {
        navigate('/main');
    };

    // Dynamic sorting function
    const sortedTransactions = [...transactions].sort((a, b) => {
        const { key, direction } = sortConfig;

        if (key === 'company.name') {
            // Special handling for nested company names
            const nameA = a.company?.name?.toLowerCase() || '';
            const nameB = b.company?.name?.toLowerCase() || '';
            if (nameA < nameB) return direction === 'asc' ? -1 : 1;
            if (nameA > nameB) return direction === 'asc' ? 1 : -1;
            return 0;
        }

        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Filter sorted transactions by type
    const buyOrders = sortedTransactions.filter((t) => t.transactionType === 'Buy');
    const sellOrders = sortedTransactions.filter((t) => t.transactionType === 'Sell');

    // Handle sorting configuration changes
    const requestSort = (key) => {
        // Prevent sorting by index (#)
        if (key === '#') return;

        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
            <div 
                className="logo ms-3" 
                onClick={() => navigate('/main', { state: { userData } })} // Pass userData when navigating to main page
            />
                <h1 className="h2 ms-3 mb-0 text-white">Transaction History</h1>
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

            <div className="container-fluid vh-100 p-4">
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        {/* Buy Orders */}
                        <div className="mb-5">
                            <h3 className="text-success text-center">Buy Orders</h3>
                            {buyOrders.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="custom-table">
                                        <thead className="table-dark">
                                            <tr>
                                                <th onClick={() => requestSort('company.name')}>Company</th>
                                                <th onClick={() => requestSort('transactionStatus')}>Status</th>
                                                <th onClick={() => requestSort('quantity')}>Quantity</th>
                                                <th onClick={() => requestSort('stockValue')}>Stock Value</th>
                                                <th onClick={() => requestSort('transactionValue')}>Total Value</th>
                                                <th onClick={() => requestSort('timeOfTransaction')}>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {buyOrders.map((transaction, index) => (
                                                <tr key={transaction.id}>

                                                    <td>{transaction.company?.name || 'N/A'}</td>
                                                    <td>{transaction.transactionStatus}</td>
                                                    <td>{transaction.quantity}</td>
                                                    <td>${transaction.stockValue.toFixed(2)}</td>
                                                    <td>${transaction.transactionValue.toFixed(2)}</td>
                                                    <td>{new Date(transaction.timeOfTransaction).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="alert alert-info text-center">No Buy Orders Found.</div>
                            )}
                        </div>

                        {/* Sell Orders */}
                        <div>
                            <h3 className="text-danger text-center">Sell Orders</h3>
                            {sellOrders.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="custom-table">
                                        <thead className="table-dark">
                                            <tr>

                                                <th onClick={() => requestSort('company.name')}>Company</th>
                                                <th onClick={() => requestSort('transactionStatus')}>Status</th>
                                                <th onClick={() => requestSort('quantity')}>Quantity</th>
                                                <th onClick={() => requestSort('stockValue')}>Stock Value</th>
                                                <th onClick={() => requestSort('transactionValue')}>Total Value</th>
                                                <th onClick={() => requestSort('timeOfTransaction')}>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sellOrders.map((transaction, index) => (
                                                <tr key={transaction.id}>
                                                    <td>{transaction.company?.name || 'N/A'}</td>
                                                    <td>{transaction.transactionStatus}</td>
                                                    <td>{transaction.quantity}</td>
                                                    <td>${transaction.stockValue.toFixed(2)}</td>
                                                    <td>${transaction.transactionValue.toFixed(2)}</td>
                                                    <td>{new Date(transaction.timeOfTransaction).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="alert alert-info text-center">No Sell Orders Found.</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
