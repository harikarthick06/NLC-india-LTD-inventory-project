import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  logout: () => api.post('/auth/logout').then((r) => r.data.data),
};
