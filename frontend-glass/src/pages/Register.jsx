import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Ошибка регистрации');
            navigate('/login');
        } catch (err) {
            setError('Не удалось создать аккаунт');
        }
    };

    return (
        <div className="auth-page fashion-bg">
            <div className="auth-card fashion-card">
                <h2 className="auth-title">Регистрация</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="field">
                        <span>Электронная почта</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="field">
                        <span>Пароль</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Создать аккаунт</button>
                    {error && <div className="error">{error}</div>}
                    <p className="muted">
                        Уже есть аккаунт? <Link to="/login">Войти</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
