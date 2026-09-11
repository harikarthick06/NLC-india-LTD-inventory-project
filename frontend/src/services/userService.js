import api from './api';

export const userService = {
  list: () => api.get('/users').then((r) => r.data.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data.data),
};
