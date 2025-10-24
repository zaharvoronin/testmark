import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ListingPage() {
    const { id } = useParams();
    const [it, setIt] = useState(null);

    useEffect(() => {
        fetchListing();
    }, []);

    async function fetchListing() {
        try {
            const res = await axios.get(`${API}/api/listings/${id}`);
            setIt(res.data);
        } catch (err) {
            console.error('Ошибка при загрузке:', err);
        }
    }

    async function buy() {
        const auth = JSON.parse(localStorage.getItem('auth') || 'null');
        if (!auth || !auth.token) {
            alert('Войдите в аккаунт перед покупкой');
            return;
        }

        try {
            const res = await axios.post(
                `${API}/api/order/create`,
                { listing_id: id, amount: it.price },
                { headers: { Authorization: 'Bearer ' + auth.token } }
            );
            alert('Заказ создан (эскроу): ' + res.data.order_id);
        } catch (err) {
            alert('Ошибка при создании заказа');
            console.error(err);
        }
    }

    if (!it) {
        return <div className="container">Загрузка...</div>;
    }

    return (
        <main className="container listing-page">
            <div className="images">
                {it.images
                    ? it.images.split(',').map((im, i) => (
                        <img
                            key={i}
                            src={window.location.origin.replace(':3001', ':4000') + im}
                            alt=""
                        />
                    ))
                    : 'Нет изображений'}
            </div>

            <div className="info">
                <h2>{it.title}</h2>
                <p>{it.description}</p>
                <p className="price">Цена: {it.price} ₽</p>
                <p>
                    Продавец: {it.seller_name} {it.seller_verified ? '✅' : ''}
                </p>
                <button onClick={buy}>Купить (эскроу)</button>
            </div>
        </main>
    );
}
