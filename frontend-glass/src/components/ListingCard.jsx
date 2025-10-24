import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loadAuth } from '../utils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ListingCard({ item, onDeleted }) {
    const auth = loadAuth();

    // Проверка прав на удаление
    const isAdmin = auth?.user?.email === 'voroninzaharfox11@gmail.com';
    const isOwner = auth?.user?.id === item.sellerId;
    const canDelete = isAdmin || isOwner;

    async function handleDelete() {
        if (!window.confirm('Удалить объявление?')) return;

        try {
            await axios.delete(`${API}/api/listings/${item.id}`, {
                headers: { Authorization: 'Bearer ' + auth.token }
            });
            alert('Объявление удалено');
            onDeleted(item.id); // уведомляем родителя
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка при удалении');
        }
    }

    const img = item.images ? item.images.split(',')[0] : null;

    return (
        <div className="card">
            <Link to={'/listing/' + item.id} className="card-link">
                <div className="card-img">
                    {img ? (
                        <img src={window.location.origin.replace(':3001', ':4000') + img} alt="" />
                    ) : (
                        <div className="noimg">No image</div>
                    )}
                </div>
                <div className="card-body">
                    <h3>{item.title}</h3>
                    <p className="price">{item.price} ₽</p>
                    <p className="seller">
                        Продавец: {item.seller_name} {item.seller_verified ? '✅' : ''}
                    </p>
                </div>
            </Link>
            {canDelete && (
                <button className="delete-btn" onClick={handleDelete}>
                    Удалить
                </button>
            )}
        </div>
    );
}
