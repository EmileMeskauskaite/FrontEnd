import { useState, useEffect } from 'react';
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

    const totalPortfolioValue = userData?.userPortfolioStocks
        ? userData.userPortfolioStocks.reduce((sum, stock) => sum + stock.currentTotalValue, 0)
        : 0;

    const [wallet, setWallet] = useState({
        availableFunds: userData?.balance || 0,
        totalPortfolioValue,
    });

    const [marketData, setMarketData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCompanies, setVisibleCompanies] = useState(6); // Initially load 9 companies
    const [flashState, setFlashState] = useState({});

    useEffect(() => {
        if (userData?.id) {
            fetchUserProfile(userData.id);
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
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }

            const data = await response.json();

            const totalPortfolioValue = data.userPortfolioStocks
                ? data.userPortfolioStocks.reduce(
                      (sum, stock) => sum + (stock.currentTotalValue || 0),
                      0
                  )
                : 0;

            setWallet({
                availableFunds: data.balance || 0,
                totalPortfolioValue,
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchMarketData = async () => {
        try {
            const response = await fetch('http://localhost:5169/api/marketdata/getallcompanies');

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
                            return {
                                id: company.id,
                                companyName: company.name,
                                stockIndex: 'N/A',
                                stockData: [],
                            };
                        }
                    } catch (error) {
                        return {
                            id: company.id,
                            companyName: company.name,
                            stockIndex: 'N/A',
                            stockData: [],
                        };
                    }
                });

                const fullMarketData = await Promise.all(fullMarketDataPromises);
                setMarketData(fullMarketData);
                setFilteredData(fullMarketData.slice(0, visibleCompanies)); // Initially show first 9
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = marketData.filter(
                (stock) =>
                    stock.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    stock.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(marketData.slice(0, visibleCompanies)); // Reset to initial data
        }
    }, [searchQuery, marketData, visibleCompanies]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const loadMoreCompanies = () => {
        setVisibleCompanies((prev) => prev + 9);
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/', { state: { logout: true } });
    };

    return (
        <div className="container-fluid vh-100 p-0 investment-background">
            <header className="custom-header d-flex justify-content-between align-items-center shadow-sm" style={{ height: '80px' }}>
                <div
                    className="logo ms-3"
                    onClick={() => navigate('/main', { state: { userData } })}
                />
                <h1 className="h2 ms-3 mb-0 text-white">
                    Welcome, {userData ? `${userData.firstName}` : 'User'}!
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
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
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

            <main className="container py-5">
                <section className="mb-5">
                    <h3 className="text-center mb-4">Wallet & Portfolio Overview</h3>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card text-white semi-transparent-card mb-3 shadow-lg">
                                <div className="card-header">Money Left in Wallet</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.availableFunds.toFixed(2)}</h3>
                                    <p className="card-text">My current available funds</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card text-white custom-peach-color mb-3 shadow-lg">
                                <div className="card-header">Current Portfolio Value</div>
                                <div className="card-body">
                                    <h3 className="card-title">${wallet.totalPortfolioValue.toFixed(2)}</h3>
                                    <p className="card-text">My current portfolio worth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-5">
                    <h3 className="text-center mb-4">Market Trends</h3>
                    <div className="row justify-content-center mb-4">
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Search by stock name or symbol..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        {filteredData.map((stock, index) => (
                            <div key={index} className="col-md-4 mb-3">
                                <div
                                    className="card shadow-sm"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        navigate(`/stock/${stock.id}`, {
                                            state: { stockName: stock.id, companyName: stock.companyName },
                                        })
                                    }
                                >
                                    <div className="card-body">
                                        <h5 className="card-title">{stock.companyName}</h5>
                                        <p
                                            className={`card-text ${
                                                flashState[stock.id] === 'up'
                                                    ? 'fw-bold stock-green'
                                                    : flashState[stock.id] === 'down'
                                                    ? 'fw-bold stock-red'
                                                    : ''
                                            }`}
                                        >
                                            Stock price: ${stock.stockIndex}
                                        </p>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Conditionally render "Load More Companies" button */}
                    {!searchQuery && filteredData.length < marketData.length && (
                        <div className="text-center mt-4">
                            <button className="btn custom-btn mb-3" onClick={loadMoreCompanies}>
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
