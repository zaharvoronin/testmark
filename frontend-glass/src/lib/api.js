import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:4000', // если бэкенд на 4000
});
let token = null;
api.setToken = (t) => {
    token = t;
    if(t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    else delete api.defaults.headers.common['Authorization'];
};
export default api;
