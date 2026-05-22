import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Always use the absolute backend URL.
// Relative paths ('/api') break on SSR (Next.js server-side) because Node.js
// has no base URL to resolve them against — it silently falls back to localhost.
// The vercel.json rewrite is a browser-only proxy and doesn't help SSR requests.
const BACKEND_URL = 'https://rydo-backend-mocha.vercel.app';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor – attach JWT token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('rydo_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('rydo_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken } = res.data;
        Cookies.set('rydo_access_token', accessToken, { expires: 1 });
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        Cookies.remove('rydo_access_token');
        Cookies.remove('rydo_refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Rides ────────────────────────────────────────────────
export const ridesApi = {
  search: (params: Record<string, any>) => {
    // Strip empty strings, false booleans that NestJS validation rejects, undefined values
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === '' || v === undefined || v === null) continue;
      if (k === 'womenOnly' && v === false) continue; // don't send womenOnly=false
      clean[k] = v;
    }
    return apiClient.get('/rides/search', { params: clean });
  },
  getOne: (id: string) => apiClient.get(`/rides/${id}`),
  create: (data: any) => apiClient.post('/rides', data),
  update: (id: string, data: any) => apiClient.put(`/rides/${id}`, data),
  cancel: (id: string) => apiClient.delete(`/rides/${id}`),
  myRides: () => apiClient.get('/rides/my'),
  popularRoutes: () => apiClient.get('/rides/popular-routes'),
};

// ─── Bookings ─────────────────────────────────────────────
export const bookingsApi = {
  create: (data: any) => apiClient.post('/bookings', data),
  myBookings: () => apiClient.get('/bookings/my'),
  rideBookings: (rideId: string) => apiClient.get(`/bookings/ride/${rideId}`),
  updateStatus: (id: string, data: any) => apiClient.put(`/bookings/${id}/status`, data),
};

// ─── Users ────────────────────────────────────────────────
export const usersApi = {
  profile: () => apiClient.get('/users/profile'),
  publicProfile: (id: string) => apiClient.get(`/users/${id}/public`),
  updateProfile: (data: any) => apiClient.put('/users/profile', data),
  addVehicle: (data: any) => apiClient.post('/users/vehicles', data),
  getVehicles: () => apiClient.get('/users/vehicles/my'),
};

// ─── Chat ─────────────────────────────────────────────────
export const chatApi = {
  getMessages: (rideId: string, page = 1) => apiClient.get(`/chats/${rideId}`, { params: { page } }),
  unreadCount: () => apiClient.get('/chats/unread/count'),
};

// ─── Notifications ────────────────────────────────────────
export const notificationsApi = {
  getAll: (page = 1) => apiClient.get('/notifications', { params: { page } }),
  markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
};

// ─── Ratings ──────────────────────────────────────────────
export const ratingsApi = {
  create: (data: any) => apiClient.post('/ratings', data),
  getUserRatings: (userId: string) => apiClient.get(`/ratings/user/${userId}`),
};

// ─── Admin ────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: (params?: any) => apiClient.get('/admin/users', { params }),
  suspendUser: (id: string) => apiClient.put(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => apiClient.put(`/admin/users/${id}/activate`),
  getRides: (params?: any) => apiClient.get('/admin/rides', { params }),
  cancelRide: (id: string) => apiClient.put(`/admin/rides/${id}/cancel`),
  getBookings: (params?: any) => apiClient.get('/admin/bookings', { params }),
  verifyUser: (id: string) => apiClient.put(`/admin/users/${id}/verify`),
};
