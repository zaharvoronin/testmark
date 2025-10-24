import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import SellerProfile from './pages/SellerProfile';
import Admin from './pages/Admin';
import { useAuth } from './AuthProvider';
import './styles/globals.css';
import './styles/auth.css';

export default function App() {
    const { user, logout } = useAuth();

    return (
        <div className="app-root">
            <header className="topbar">
                <div className="brand">
                    <Link to="/"><strong>GlassBoutique</strong></Link>
                </div>
                <nav className="nav">
                    <Link to="/">Магазин</Link>
                    <Link to="/create">Создать</Link>
                    {user ? (
                        <>
                            <span className="welcome">Привет, {user.name || user.email}</span>
                            {user.role === 'admin' && <Link to="/admin" className="admin-link">Админ</Link>}
                            <button className="btn-ghost" onClick={logout}>Выйти</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-primary">Войти</Link>
                    )}
                </nav>
            </header>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Listings />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/create" element={<CreateListing />} />
                    <Route path="/seller/:id" element={<SellerProfile />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </main>
            <footer className="footer">© {new Date().getFullYear()} GlassBoutique</footer>
        </div>
    );
}
