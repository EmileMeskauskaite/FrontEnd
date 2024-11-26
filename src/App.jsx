import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MainPage from './MainPage';
import ProfilePage from './ProfilePage';
import EditProfile from './EditProfile';
import MyPortfolio from './MyPortfolio';
import StockPage from './StockPage';
import BuyStockPage from './BuyStockPage'; 
import SellStockPage from './SellStockPage'; 
import TransactionsPage from './TransactionsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/" element={<LoginPage />} /> 
                <Route path="*" element={<h1>404 Not Found</h1>} /> 
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/my-portfolio" element={<MyPortfolio />} />
                <Route path="/stock/:stockName" element={<StockPage />} />
                <Route path="/buy-stock/:stockName" element={<BuyStockPage />} /> 
                <Route path="/sell-stock/:stockName" element={<SellStockPage />} /> 
                <Route path="/transactions" element={<TransactionsPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
