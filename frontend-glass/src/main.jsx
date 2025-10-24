import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ListingPage from './pages/ListingPage';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import AppHeader from './components/AppHeader';
import './styles/globals.css';

function App() {
    return (
        <BrowserRouter>
            <AppHeader />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/listing/:id' element={<ListingPage />} />
                <Route path='/create' element={<CreateListing />} />
                <Route path='/profile' element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(<App />);
