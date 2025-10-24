import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=>{
        if(!user || user.role !== 'admin'){
            navigate("/login");
            return;
        }
        fetchListings();
    }, []);

    async function fetchListings(){
        setLoading(true);
        try{
            const res = await api.get("/api/listings");
            setListings(res.data || []);
        }catch(err){
            console.error(err);
            setError("Не удалось загрузить товары.");
        }finally{
            setLoading(false);
        }
    }

    async function remove(id){
        if(!confirm("Удалить товар?")) return;
        try{
            await api.delete(`/api/listings/${id}`);
            setListings(prev => prev.filter(x=>x._id !== id && x.id !== id));
        }catch(err){
            console.error(err);
            alert("Ошибка при удалении.");
        }
    }

    return (
        <div className="admin-page">
            <h2>Админ-панель — Управление товарами</h2>
            {loading ? <p>Загрузка...</p> : null}
            {error && <p className="error">{error}</p>}
            <div className="admin-table">
                {listings.length === 0 && !loading ? <p>Товары не найдены.</p> : listings.map(item => (
                    <div key={item._id || item.id} className="admin-row">
                        <img src={item.image || item.images?.[0] || '/placeholder.png'} alt={item.title || item.name} />
                        <div className="meta">
                            <strong>{item.title || item.name}</strong>
                            <div className="price">{item.price ? item.price + '₽' : ''}</div>
                        </div>
                        <div className="actions">
                            <button onClick={()=>navigate(`/create?edit=${item._id || item.id}`)} className="btn-ghost">Редактировать</button>
                            <button onClick={()=>remove(item._id || item.id)} className="btn-danger">Удалить</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
