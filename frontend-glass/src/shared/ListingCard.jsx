import React from 'react';
import { Link } from 'react-router-dom';

export default function ListingCard({listing}){
    const imgs = (listing.images||'').split(',').filter(Boolean);
    return (
        <div className="card listing">
            <Link to={`/listings/${listing.id}`}>
                <img src={imgs[0] || '/placeholder.png'} alt={listing.title} />
                <h3>{listing.title}</h3>
            </Link>
            <div>Цена: {listing.price} ₽</div>
            <div>Категория: {listing.category}</div>
            <div>Продавец: <Link to={`/seller/${listing.user_id}`}>{listing.seller_name}</Link></div>
        </div>
    );
}
