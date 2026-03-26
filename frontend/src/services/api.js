import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Crucial for sending HttpOnly cookies
});

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthenticated. The auth context will handle redirection by clearing state,
            // or we could dispatch a custom event here.
            window.dispatchEvent(new Event('auth-unauthorized'));
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (!error.response && error.message === 'Network Error') {
            toast.error('Network error. Check your connection.');
        }
        return Promise.reject(error);
    }
);

export default api;
