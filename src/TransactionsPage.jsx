import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'timeOfTransaction', direction: 'asc' });
    const [showSuccessModal, setShowSuccessModal] = useState(false); // For the modal
    const [successMessage, setSuccessMessage] = useState(''); // Message for the modal
    const navigate = useNavigate();

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

    const cancelTransaction = async (transaction) => {
        try {
            const payload = {
                transactionID: transaction.id,
            };

            const response = await fetch(`http://localhost:5169/api/userprofile/canceltransaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Cancel Transaction Error Data:", errorData);

                const errorMessages = errorData?.errors
                    ? Object.values(errorData.errors).flat().join(', ')
                    : errorData?.title || 'Unknown error occurred';
                throw new Error(errorMessages);
            }

            setSuccessMessage('Transaction successfully canceled.');
            setShowSuccessModal(true);

            // Refresh transactions after cancellation
            fetchTransactions(userData.id);
        } catch (error) {
            console.error("Error canceling transaction:", error.message);
            alert(`Failed to cancel transaction: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/');
    };

    const sortedTransactions = [...transactions].sort((a, b) => {
        const { key, direction } = sortConfig;

        if (key === 'company.name') {
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

    const buyTransactions = sortedTransactions.filter((transaction) => transaction.transactionType === 'Buy');
    const sellTransactions = sortedTransactions.filter((transaction) => transaction.transactionType === 'Sell');

    const requestSort = (key) => {
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
                    onClick={() => navigate('/main', { state: { userData } })}
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
                        <section className="mb-5">
                            <h3 className="text-center text-success">Buy Transactions</h3>
                            {buyTransactions.length > 0 ? (
                                <table className="custom-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th onClick={() => requestSort('company.name')}>Company</th>
                                            <th onClick={() => requestSort('transactionStatus')}>Status</th>
                                            <th onClick={() => requestSort('quantity')}>Quantity</th>
                                            <th onClick={() => requestSort('transactionValue')}>Total Value</th>
                                            <th onClick={() => requestSort('timeOfTransaction')}>Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {buyTransactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td>{transaction.company?.name || 'N/A'}</td>
                                                <td>{transaction.transactionStatus}</td>
                                                <td>{transaction.quantity}</td>
                                                <td>${transaction.transactionValue.toFixed(2)}</td>
                                                <td>{new Date(transaction.timeOfTransaction).toLocaleString()}</td>
                                                <td>
                                                    {transaction.transactionStatus === 'On Hold' && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => cancelTransaction(transaction)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="alert alert-info text-center">No Buy Transactions Found.</div>
                            )}
                        </section>

                        <section>
                            <h3 className="text-center text-danger">Sell Transactions</h3>
                            {sellTransactions.length > 0 ? (
                                <table className="custom-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th onClick={() => requestSort('company.name')}>Company</th>
                                            <th onClick={() => requestSort('transactionStatus')}>Status</th>
                                            <th onClick={() => requestSort('quantity')}>Quantity</th>
                                            <th onClick={() => requestSort('transactionValue')}>Total Value</th>
                                            <th onClick={() => requestSort('timeOfTransaction')}>Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellTransactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td>{transaction.company?.name || 'N/A'}</td>
                                                <td>{transaction.transactionStatus}</td>
                                                <td>{transaction.quantity}</td>
                                                <td>${transaction.transactionValue.toFixed(2)}</td>
                                                <td>{new Date(transaction.timeOfTransaction).toLocaleString()}</td>
                                                <td>
                                                    {transaction.transactionStatus === 'On Hold' && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => cancelTransaction(transaction)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="alert alert-info text-center">No Sell Transactions Found.</div>
                            )}
                        </section>
                    </>
                )}
            </div>

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
                                    <p>{successMessage}</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setShowSuccessModal(false)}
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

export default TransactionsPage;
