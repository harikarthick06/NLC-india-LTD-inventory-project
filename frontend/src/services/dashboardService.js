import api from './api';

export const dashboardService = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data.data),
  categoryStats: () => api.get('/dashboard/category-stats').then((r) => r.data.data),
  stockMovement: (days = 14) => api.get('/dashboard/stock-movement', { params: { days } }).then((r) => r.data.data),
};
