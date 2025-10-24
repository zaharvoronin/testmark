import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import ListingCard from "../shared/ListingCard";

export default function SellerProfile() {
    const { id } = useParams();
    const [listings, setListings] = useState([]);
    const [seller, setSeller] = useState(null);

    useEffect(() => {
        loadSeller();
    }, [id]);

    async function loadSeller() {
        try {
            // 🔹 Сначала пробуем получить продавца и его товары напрямую из API (если реализован /api/seller/:id)
            const res = await api.get(`/api/seller/${id}`).catch(() => null);
            if (res && res.data) {
                setSeller(res.data.seller);
                setListings(res.data.listings || []);
            } else {
                // 🔹 Если такого роута нет, загружаем все товары и фильтруем по user_id
                const allRes = await api.get("/api/listings");
                const all = allRes.data || [];
                const sellerListings = all.filter(
                    (l) => String(l.user_id) === String(id)
                );
                setListings(sellerListings);
                if (sellerListings[0]) {
                    setSeller({
                        id: sellerListings[0].user_id,
                        name: sellerListings[0].seller_name || "Продавец",
                        verified: sellerListings[0].seller_verified || 0,
                    });
                } else {
                    setSeller({ id, name: "Продавец", verified: 0 });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div>
            <h2>
                Профиль продавца:{" "}
                {seller ? seller.name : "Загрузка..."}{" "}
                {seller?.verified ? "✅" : ""}
            </h2>

            <div className="listing-grid">
                {listings.length > 0 ? (
                    listings.map((l) => <ListingCard key={l.id} listing={l} />)
                ) : (
                    <div>Объявлений пока нет</div>
                )}
            </div>
        </div>
    );
}
