import React, { useEffect, useState } from "react";
import api from "../lib/api";
import ListingCard from "../shared/ListingCard";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [category, setCategory] = useState("all");
    const [filters, setFilters] = useState({
        condition: "",
        price_min: "",
        price_max: "",
    });

    const categories = [
        { key: "all", label: "Все" },
        { key: "men", label: "Мужская одежда" },
        { key: "women", label: "Женская одежда" },
        { key: "kids", label: "Детская одежда" },
    ];

    useEffect(() => {
        loadListings();
    }, [category, filters]);

    async function loadListings() {
        try {
            // Собираем параметры запроса
            const params = new URLSearchParams();
            if (category !== "all") params.append("category", category);
            if (filters.condition) params.append("condition", filters.condition);
            if (filters.price_min) params.append("price_min", filters.price_min);
            if (filters.price_max) params.append("price_max", filters.price_max);

            const res = await api.get(`/api/listings?${params.toString()}`);
            setListings(res.data || []);
        } catch (e) {
            console.error("Ошибка загрузки объявлений:", e);
        }
    }

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className="listings-page">
            <h2>Объявления</h2>

            {/* 🔹 Панель категорий */}
            <div className="categories">
                {categories.map((c) => (
                    <button
                        key={c.key}
                        className={category === c.key ? "active" : ""}
                        onClick={() => setCategory(c.key)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* 🔹 Фильтры */}
            <div className="filters">
                <select
                    name="condition"
                    value={filters.condition}
                    onChange={handleFilterChange}
                >
                    <option value="">Все состояния</option>
                    <option value="new">Новое</option>
                    <option value="like_new">Как новое</option>
                    <option value="used">Б/у</option>
                </select>

                <input
                    type="number"
                    name="price_min"
                    placeholder="Цена от"
                    value={filters.price_min}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="price_max"
                    placeholder="Цена до"
                    value={filters.price_max}
                    onChange={handleFilterChange}
                />

                <button onClick={loadListings}>Применить</button>
            </div>

            {/* 🔹 Список объявлений */}
            <div className="listing-grid">
                {listings.length > 0 ? (
                    listings.map((item) => <ListingCard key={item.id} listing={item} />)
                ) : (
                    <div>Нет товаров</div>
                )}
            </div>
        </div>
    );
}
