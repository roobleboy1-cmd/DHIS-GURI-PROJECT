import axios from 'axios';

// Get base URL from environment or fallback to /api for local Vite proxy
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get active token from sessionStorage or localStorage
const getActiveToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getActiveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials if token expired/invalid from both storages
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on the login or register pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
