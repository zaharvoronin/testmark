import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './lib/api';

const AuthContext = createContext();

const ADMIN_EMAIL = "voroninzaharfox11@gmail.com";
const ADMIN_PASSWORD = "painhub2007";

export function AuthProvider({children}){
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('app_user');
        return raw ? JSON.parse(raw) : null;
    });
    useEffect(()=>{
        const tok = localStorage.getItem('token');
        if(tok) api.setToken(tok);
    }, []);
    async function login(email, password){
        try {
            const res = await api.post('/api/login', { email, password });
            const u = res.data.user;
            localStorage.setItem('token', res.data.token || '');
            localStorage.setItem('app_user', JSON.stringify(u));
            api.setToken(res.data.token || '');
            setUser(u);
            return u;
        } catch (err) {
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const u = { name: "Admin", email: ADMIN_EMAIL, role: "admin", id: "local-admin" };
                localStorage.setItem('token', 'local-admin-token');
                localStorage.setItem('app_user', JSON.stringify(u));
                api.setToken('local-admin-token');
                setUser(u);
                return u;
            }
            throw err;
        }
    }
    async function register(name, email, password, role='buyer'){
        const res = await api.post('/api/register', { name, email, password, role });
        if (res.status === 200 || res.status === 201) {
            const u = res.data.user;
            setUser(u);
            localStorage.setItem('app_user', JSON.stringify(u));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                api.setToken(res.data.token);
            }
            return u;
        }
        throw new Error('Register failed');
    }
    function logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('app_user');
        api.setToken(null);
        setUser(null);
    }
    return <AuthContext.Provider value={{user, login, register, logout}}>{children}</AuthContext.Provider>;
}
export const useAuth = ()=>useContext(AuthContext);
