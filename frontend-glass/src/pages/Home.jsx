import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Home() {
    const [list, setList] = useState([]);
    const [q, setQ] = useState('');

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        try {
            const res = await axios.get(`${API}/api/listings`);
            setList(res.data);
        } catch (err) {
            console.error('Ошибка загрузки списка:', err);
        }
    }

    async function search(e) {
        e.preventDefault();
        try {
            const res = await axios.get(`${API}/api/listings`, { params: { q } });
            setList(res.data);
        } catch (err) {
            console.error('Ошибка поиска:', err);
        }
    }

    // Удаляем из списка по ID после удаления на сервере
    function handleDeleted(id) {
        setList(list.filter((item) => item.id !== id));
    }

    return (
        <main className="container">
            <section className="hero">
                <h1>GlassMarket — площадка объявлений</h1>
                <form onSubmit={search} className="search">
                    <input
                        placeholder="Поиск по товарам, бренду, описанию"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button type="submit">Найти</button>
                </form>
            </section>

            <section className="grid">
                {list.map((it) => (
                    <ListingCard key={it.id} item={it} onDeleted={handleDeleted} />
                ))}
            </section>
        </main>
    );
}
