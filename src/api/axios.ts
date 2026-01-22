import axios from 'axios';
import { getAccessToken, clearTokens } from '@/utils/storage';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Adjust base URL if needed
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearTokens();
        }
        return Promise.reject(error);
    }
);

export default api;
