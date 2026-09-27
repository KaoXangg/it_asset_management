import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Cho phép gửi/nhận cookie httpOnly "refreshToken" (đặt bởi /auth/login, /auth/refresh)
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access token sống ngắn (30 phút). Khi hết hạn, thử refresh 1 lần bằng cookie
// httpOnly trước khi bắt đăng nhập lại — người dùng không bị văng ra giữa chừng.
let refreshPromise = null;

function clearSessionAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Assets API
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  getByCode: (code) => api.get(`/assets/code/${encodeURIComponent(code)}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getStats: () => api.get('/assets/stats'),
  regenerateQrCode: (id) => api.post(`/assets/${id}/qrcode`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`/assets/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// URL gốc của server backend (không có /api) — dùng để ghép với image_url trả về từ API
// (image_url là đường dẫn tương đối, ví dụ /uploads/assets/asset-1-123.jpg)
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');
export const assetImageUrl = (imageUrl) => (imageUrl ? `${SERVER_URL}${imageUrl}` : null);

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getMyAssignments: () => api.get('/assignments/my-assignments'),
  create: (data) => api.post('/assignments', data),
  returnAsset: (id, data) => api.put(`/assignments/${id}/return`, data),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Chat API (chatbox AI - gọi qua backend, KHÔNG gọi thẳng AI provider từ frontend
// để tránh lộ API key trong bundle JS)
export const chatAPI = {
  sendMessage: (message, history) => api.post('/chat', { message, history }),
};

// Reports API
export const reportsAPI = {
  getActivityLogs: (params) => api.get('/reports/activity-logs', { params }),
  getDashboard: () => api.get('/reports/dashboard'),
  exportAssets: () => api.get('/reports/export/assets', { responseType: 'blob' }),
  exportAssignments: () => api.get('/reports/export/assignments', { responseType: 'blob' }),
  exportMaintenance: () => api.get('/reports/export/maintenance', { responseType: 'blob' }),
  exportDashboardPDF: () => api.get('/reports/export/dashboard-pdf', { responseType: 'blob' }),
  sendTestNotification: () => api.post('/reports/notify-test'),
  getDueMaintenance: () => api.get('/reports/due-maintenance'),
  getMaintenanceCost: (params) => api.get('/reports/maintenance-cost', { params }),
};

