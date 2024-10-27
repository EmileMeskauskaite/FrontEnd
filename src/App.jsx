import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MainPage from './MainPage';
import ProfilePage from './ProfilePage';
import EditProfile from './EditProfile';
import MyPortfolio from './MyPortfolio';

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
                
            </Routes>
        </Router>
    );
}

export default App;
