import api from './api';

export const inventoryService = {
  stockIn: (payload) => api.post('/inventory/stock-in', payload).then((r) => r.data.data),
  stockOut: (payload) => api.post('/inventory/stock-out', payload).then((r) => r.data.data),
  stockReturn: (payload) => api.post('/inventory/return', payload).then((r) => r.data.data),
  adjust: (payload) => api.post('/inventory/adjust', payload).then((r) => r.data.data),
  listTransactions: (params) => api.get('/inventory/transactions', { params }).then((r) => r.data),
  transactionsForProduct: (productId) =>
    api.get(`/inventory/transactions/${productId}`).then((r) => r.data.data),
};
