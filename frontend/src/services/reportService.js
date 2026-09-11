import api from './api';

const REPORTS = {
  inventorySummary: 'inventory-summary',
  lowStock: 'low-stock',
  outOfStock: 'out-of-stock',
  valuation: 'valuation',
  category: 'category',
  supplier: 'supplier',
  stockMovement: 'stock-movement',
};

export const reportService = {
  fetch: (key, params) => api.get(`/reports/${REPORTS[key]}`, { params }).then((r) => r.data.data),
  downloadCsvUrl: (key, params) => {
    const query = new URLSearchParams({ ...params, format: 'csv' }).toString();
    return `${api.defaults.baseURL}/reports/${REPORTS[key]}?${query}`;
  },
};
