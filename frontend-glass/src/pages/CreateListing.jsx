import React, { useState } from "react";
import axios from "axios";

export default function CreateListing() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [images, setImages] = useState([]);

    const handleFileChange = (e) => setImages([...e.target.files]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !condition || images.length === 0) {
            alert("Выберите категорию, состояние и хотя бы 1 фото!");
            return;
        }

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("condition", condition);
        images.forEach((file) => formData.append("images", file));

        try {
            await axios.post("/api/listings", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Товар успешно выложен!");
            window.location.href = "/";
        } catch (err) {
            alert("Ошибка: " + err.response?.data?.error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="number"
                placeholder="Цена"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Выберите категорию</option>
                <option value="men">Мужская одежда</option>
                <option value="women">Женская одежда</option>
                <option value="kids">Детская одежда</option>
            </select>

            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">Состояние</option>
                <option value="new">Новое</option>
                <option value="like_new">Как новое</option>
                <option value="used">Б/у</option>
            </select>

            <input type="file" multiple onChange={handleFileChange} />
            <button type="submit">Создать объявление</button>
        </form>
    );
}
