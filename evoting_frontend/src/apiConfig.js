import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Configured network client pointing straight at the configured Spring Boot API endpoint
const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Outgoing Interceptor: Automatically injects your application JWT into secure calls
API.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('voting_jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API_BASE_URL };
export default API;