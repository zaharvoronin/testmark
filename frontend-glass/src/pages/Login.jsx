import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Вход администратора
            if (email === 'voroninzaharfox11@gmail.com' && password === 'painhub2007') {
                localStorage.setItem('role', 'admin');
                navigate('/admin');
                return;
            }

            // Обычный вход
            const res = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Ошибка входа');
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="auth-page fashion-bg">
            <div className="auth-card fashion-card">
                <h2 className="auth-title">Вход в GlassMarket</h2>
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="field">
                        <span>Электронная почта</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="field">
                        <span>Пароль</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Войти</button>
                    {error && <div className="error">{error}</div>}
                    <p className="muted">
                        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
