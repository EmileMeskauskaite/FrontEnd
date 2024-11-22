import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Already included
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Add this line
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MainPage from './MainPage';
import ProfilePage from './ProfilePage';
import EditProfile from './EditProfile';
import MyPortfolio from './MyPortfolio';
import StockPage from './StockPage';
import TransactionsPage from './TransactionsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/" element={<LoginPage />} /> {/* Redirect to login page by default */}
                <Route path="*" element={<h1>404 Not Found</h1>} /> {/* 404 Page */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/my-portfolio" element={<MyPortfolio />} />
                <Route path="/stock/:id" element={<StockPage />} />
                <Route path="/transactions" element={<TransactionsPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
