import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/me')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original)).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(original);
      } catch (err) {
        processQueue(err);
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const adminAPI = {
  getUsers: () => api.get('/auth/users'),
  updateRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const casesAPI = {
  submit: (data) => api.post('/cases/submit', data),
  getAll: (page, limit) => api.get(`/cases?page=${page}&limit=${limit}`),
  getOne: (id) => api.get(`/cases/${id}`),
  getMy: (page, limit) => api.get(`/cases/my?page=${page}&limit=${limit}`),
  getAssigned: (page, limit) => api.get(`/cases/assigned?page=${page}&limit=${limit}`),
  assign: (caseId, managerId) => api.put('/cases/assign', { caseId, managerId }),
  updateStatus: (id, status) => api.put(`/cases/${id}/status`, { status }),
  addNote: (id, text) => api.post(`/cases/${id}/note`, { text }),
};

export const pollsAPI = {
  getAll: () => api.get('/polls'),
  create: (data) => api.post('/polls', data),
  vote: (id, optionIndex) => api.post(`/polls/${id}/vote`, { optionIndex }),
};

export const analyticsAPI = {
  byDepartment: () => api.get('/analytics/by-department'),
  byStatus: () => api.get('/analytics/by-status'),
  byCategory: () => api.get('/analytics/by-category'),
  hotspots: () => api.get('/analytics/hotspots'),
};

export const aiAPI = {
  summarize: (id) => api.get(`/ai/summarize/${id}`),
  insight: (analyticsData) => api.post('/ai/insight', { analyticsData }),
  suggest: (description) => api.post('/ai/suggest', { description }),
};

export const hubAPI = {
  getAll: (type) => api.get(`/hub${type ? `?type=${type}` : ''}`),
  create: (data) => api.post('/hub', data),
  delete: (id) => api.delete(`/hub/${id}`),
};

export default api;