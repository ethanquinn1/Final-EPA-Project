import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (when we implement auth)
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

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Client API methods
export const clientAPI = {
  // Get all clients with optional filters
  getClients: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Get client by ID
  getClient: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update client
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Get client statistics
  getClientStats: async () => {
    const response = await api.get('/clients/stats/summary');
    return response.data;
  },

  // Recalculate engagement score
  calculateEngagement: async (id) => {
    const response = await api.post(`/clients/${id}/calculate-engagement`);
    return response.data;
  },
};

// Auth API methods (for future use)
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;