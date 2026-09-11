import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nlc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('nlc_token');
      localStorage.removeItem('nlc_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
}

export default api;
