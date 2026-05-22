import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Use NEXT_PUBLIC_API_URL if set (e.g. for local dev pointing at a remote backend).
// On Vercel production, leave BASE_URL empty so axios uses relative /api/* paths
// which are transparently proxied to the backend via vercel.json rewrites.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('rydo_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('rydo_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL ? BASE_URL + '/api' : '/api'}/auth/refresh`, { refreshToken });
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

// Rides API
export const ridesApi = {
  search: (params: Record<string, any>) => apiClient.get('/rides/search', { params }),
  getOne: (id: string) => apiClient.get(`/rides/${id}`),
  create: (data: any) => apiClient.post('/rides', data),
  update: (id: string, data: any) => apiClient.put(`/rides/${id}`, data),
  cancel: (id: string) => apiClient.delete(`/rides/${id}`),
  myRides: () => apiClient.get('/rides/my'),
  popularRoutes: () => apiClient.get('/rides/popular-routes'),
};

// Bookings API
export const bookingsApi = {
  create: (data: any) => apiClient.post('/bookings', data),
  myBookings: () => apiClient.get('/bookings/my'),
  rideBookings: (rideId: string) => apiClient.get(`/bookings/ride/${rideId}`),
  updateStatus: (id: string, data: any) => apiClient.put(`/bookings/${id}/status`, data),
};

// Users API
export const usersApi = {
  profile: () => apiClient.get('/users/profile'),
  publicProfile: (id: string) => apiClient.get(`/users/${id}/public`),
  updateProfile: (data: any) => apiClient.put('/users/profile', data),
  addVehicle: (data: any) => apiClient.post('/users/vehicles', data),
  getVehicles: () => apiClient.get('/users/vehicles/my'),
};

// Chat API
export const chatApi = {
  getMessages: (rideId: string, page = 1) => apiClient.get(`/chats/${rideId}`, { params: { page } }),
  unreadCount: () => apiClient.get('/chats/unread/count'),
};

// Notifications API
export const notificationsApi = {
  getAll: (page = 1) => apiClient.get('/notifications', { params: { page } }),
  markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
};

// Ratings API
export const ratingsApi = {
  create: (data: any) => apiClient.post('/ratings', data),
  getUserRatings: (userId: string) => apiClient.get(`/ratings/user/${userId}`),
};

// Admin API
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
