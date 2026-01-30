import axios from 'axios';

// IMPORTANT: For Android Emulator use 'http://10.0.2.2:8080/api'
// For Physical Device use your computer's IP address e.g., 'http://192.168.1.5:8080/api'
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const customerService = {
  getAll: () => api.get('/customers'),
  getActive: () => api.get('/customers/active'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const paymentService = {
  getAll: () => api.get('/payments'),
  getByCustomer: (customerId) => api.get(`/payments/customer/${customerId}`),
  getByDateRange: (startDate, endDate) =>
    api.get(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export default api;
