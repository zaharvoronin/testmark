import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import { loadAuth } from '../utils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Profile() {
    const [list, setList] = useState([]);
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const storedAuth = loadAuth();
        if (!storedAuth || !storedAuth.user) {
            alert('Сначала войдите в систему');
            window.location.href = '/login';
            return;
        }
        setAuth(storedAuth);
        fetchMyListings(storedAuth);
    }, []);

    async function fetchMyListings(auth) {
        try {
            const res = await axios.get(`${API}/api/listings/mine`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setList(res.data);
        } catch (err) {
            console.error('Ошибка загрузки моих объявлений:', err);
        }
    }

    function handleDeleted(id) {
        setList((prev) => prev.filter((item) => item.id !== id));
    }

    return (
        <main className="container">
            <h2>Мои объявления</h2>
            <section className="grid">
                {list.length === 0 && <p>У вас пока нет объявлений</p>}
                {list.map((it) => (
                    <ListingCard key={it.id} item={it} auth={auth} onDeleted={handleDeleted} />
                ))}
            </section>
        </main>
    );
}
