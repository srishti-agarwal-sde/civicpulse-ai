const getApiBaseUrl = () => {
  // If backend is running on the same domain (e.g. deployed on Cloud Run container serving both)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

import axios from 'axios';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry or unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage if token fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login, but handle gracefully in AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
