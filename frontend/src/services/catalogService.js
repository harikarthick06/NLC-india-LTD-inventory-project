import api from './api';

function crudFor(resource) {
  return {
    list: () => api.get(`/${resource}`).then((r) => r.data.data),
    getById: (id) => api.get(`/${resource}/${id}`).then((r) => r.data.data),
    create: (payload) => api.post(`/${resource}`, payload).then((r) => r.data.data),
    update: (id, payload) => api.put(`/${resource}/${id}`, payload).then((r) => r.data.data),
    remove: (id) => api.delete(`/${resource}/${id}`).then((r) => r.data.data),
  };
}

export const categoryService = crudFor('categories');
export const supplierService = crudFor('suppliers');
export const locationService = crudFor('locations');
