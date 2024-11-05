import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const PurchasesPage = () => {
    const navigate = useNavigate();
    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;
    const [purchases, setPurchases] = useState([]); 

    useEffect(() => {
        if (userData && userData.id) {
            fetchPurchases(userData.id); 
        } else {
            console.error("User ID is undefined, cannot fetch purchases.");
        }
    }, [userData]);

    const fetchPurchases = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5169/api/userprofile/getuserprofile?id=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify({}), 
            });

            if (!response.ok) throw new Error(`Failed to fetch purchases: ${response.status}`);

            const data = await response.json();
            setPurchases(data.userTransactions); 
            //console.log(data.userTransactions);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            alert("Could not fetch purchases. Please try again later.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/', { state: { logout: true } });
    };

    return (
        <div className="container-fluid vh-100 p-0 purchase-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div 
                    className="logo ms-3" 
                    onClick={() => navigate('/main')} 
                    style={{ cursor: 'pointer' }}
                >
                    <img src="/baltaslogo.png" alt="Logo" style={{ height: '60px' }} />
                </div>
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
                        <li><button className="dropdown-item" onClick={() => navigate('/profile', { state: { userData } })}>Edit Profile</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/my-portfolio', { state: { userData } })}>My Portfolio</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/purchases')}>Purchases History</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/sales')}>Sales History</button></li>
                        <li><button className="dropdown-item text-danger" onClick={handleLogout}>Sign Out</button></li>
                    </ul>
                </div>
            </header>

            <div className="container d-flex flex-column align-items-center py-5">
                <h2 className="mb-4 text-center cute-heading">My Purchases</h2>
                <div className="row w-100 justify-content-center">
                    {purchases.length > 0 ? purchases.map((transaction) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={transaction.id}>
                            <div className="card shadow-lg cute-card">
                                <div className="card-body">
                                    <h5 className="card-title text-primary mb-2">
                                        {transaction.buyOrder.company.name}
                                    </h5>
                                    <p className="card-text text-muted mb-1">
                                        <strong>Transaction Type:</strong> {transaction.transactionType === 0 ? 'Purchase' : 'Other'}
                                    </p>
                                    <p className="card-text text-muted mb-1">
                                        <strong>Date:</strong> {new Date(transaction.buyOrder.timeOfBuying).toLocaleDateString()}
                                    </p>
                                    <p className="card-text">
                                        <strong>Price:</strong> ${transaction.buyOrder.price.toFixed(2)}
                                    </p>
                                    <p className="card-text">
                                        <strong>Quantity:</strong> {transaction.buyOrder.quantity}
                                    </p>
                                    <button
                                        className="btn btn-outline-primary w-100 cute-button"
                                        onClick={() => alert(`Details for ${transaction.buyOrder.company.name}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-muted text-center">No purchases found.</div>
                    )}
                </div>

                <button 
                    className="btn btn-secondary mt-4 cute-back-button" 
                    onClick={() => navigate('/main')}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PurchasesPage;
