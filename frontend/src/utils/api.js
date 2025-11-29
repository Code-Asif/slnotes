import axios from 'axios';
import toast from 'react-hot-toast';

// Use relative path in development (works with Vite proxy) or full URL in production
// Ensure API_URL always ends with /api
let API_URL = import.meta.env.VITE_API_URL || '/api';

// If VITE_API_URL is set but doesn't end with /api, append it
if (API_URL && !API_URL.endsWith('/api')) {
  // Remove trailing slash if present, then add /api
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
      // Don't show toast for 401 errors as they're handled by redirect
      return Promise.reject(error);
    }
    
    // Only show toast for errors that aren't already handled by the component
    // Components can handle their own error messages if needed
    if (error.response?.status !== 401 && !error.config?.skipErrorToast) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

