import React from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader() {
    const isAdmin = localStorage.getItem('role') === 'admin';

    return (
        <header className="topbar">
            <div className="brand">
                <Link to="/"><strong>GlassMarket</strong></Link>
            </div>
            <nav className="nav">
                <Link to="/">Главная</Link>
                {isAdmin ? <Link to="/admin">Админ</Link> : <Link to="/login">Войти</Link>}
            </nav>
        </header>
    );
}
