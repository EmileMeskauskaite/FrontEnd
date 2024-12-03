import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const StockPage = () => {
    const { stockName } = useParams(); // Get stock ID from the URL
    const navigate = useNavigate();
    const location = useLocation();

    const [stockData, setStockData] = useState(null); // Holds stock data
    const [companyName, setCompanyName] = useState(location.state?.companyName || stockName);
    const [userStocks, setUserStocks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flashClass, setFlashClass] = useState(''); // Flash effect for price changes
    const [historicalData, setHistoricalData] = useState([]);
    const [startDate, setStartDate] = useState(
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
    ); // Default: last 7 days
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Default: today
    const [chartData, setChartData] = useState(null);

    const storedUserData = localStorage.getItem('userData');
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    useEffect(() => {
        if (location.state?.companyName) {
            setCompanyName(location.state.companyName);
        }
        fetchStockData(stockName);
        fetchUserStocks();
        fetchHistoricalData();
    }, [stockName]);

    const fetchStockData = async (symbol) => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/marketdata/marketdata/getcompanylivepricedistinct?symbols=${symbol}`
            );

            if (!response.ok) throw new Error(`Failed to fetch stock data: ${response.status}`);

            const data = await response.json();
            if (!data || data.length === 0) throw new Error(`No stock data available for symbol: ${symbol}`);

            const latestStock = data[0];
            setStockData({
                companyName: symbol,
                stockIndex: latestStock.price,
                stockData: data,
            });
        } catch (err) {
            console.error("Error fetching stock data:", err.message);
            setError(err.message);
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

            if (!response.ok) throw new Error(`Failed to fetch user stocks: ${response.status}`);

            const data = await response.json();
            const ownedStock = data.userPortfolioStocks?.find(
                (stock) => stock.company.id === stockName
            );
            setUserStocks(ownedStock || null);
        } catch (err) {
            console.error("Error fetching user stocks:", err.message);
        }
    };

    const fetchHistoricalData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5169/api/marketdata/marketdata/getcompanypricehistory?symbol=${stockName}&startDate=${startDate}&endDate=${endDate}`
            );
    
            if (!response.ok) throw new Error(`Failed to fetch historical data: ${response.status}`);
    
            const data = await response.json();
    
            // Remove duplicates and sort chronologically
            const uniqueData = Object.values(
                data.reduce((acc, point) => {
                    const dateKey = new Date(point.date).toISOString().split("T")[0]; // Use the date as a key
                    if (!acc[dateKey]) {
                        acc[dateKey] = point; // Only keep the first occurrence
                    }
                    return acc;
                }, {})
            ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    
            setHistoricalData(uniqueData);
    
            const labels = uniqueData.map((point) => new Date(point.date).toLocaleDateString());
            const prices = uniqueData.map((point) => point.eodPrice);
    
            setChartData({
                labels,
                datasets: [
                    {
                        label: "Historical Prices",
                        data: prices,
                        borderColor: "rgba(75, 192, 192, 1)",
                        tension: 0.1,
                    },
                ],
            });
        } catch (err) {
            console.error("Error fetching historical data:", err.message);
            setError(err.message);
        }
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
                            <div className="card-body" style={{ padding: '10px' }}>
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
    
                {/* Buy and Sell Buttons */}
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
                <div className="container mt-5">
    <div className="card shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
        {/* Card Header */}
        <div className="card-header semi-transparent-card text-white text-center">
            <h4 className="m-0">Historical Data</h4>
        </div>

        {/* Card Body */}
        <div className="card-body">
            {/* Filter Section */}
            <div className="row align-items-end mb-4">
                <div className="col-md-4">
                    <label className="form-label">Start Date:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">End Date:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <button
                        className="btn custom-btn w-100"
                        onClick={fetchHistoricalData}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Chart Section */}
            <div className="chart-container" style={{ height: '400px' }}>
                {chartData ? (
                    <Line
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Date',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Price ($)',
                                    },
                                },
                            },
                        }}
                    />
                ) : (
                    <p className="text-center">No historical data available for this range.</p>
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
