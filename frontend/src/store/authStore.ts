import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { apiClient } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ userId: string }>;
  verifyOtp: (userId: string, otp: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  refreshAccessToken: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  dateOfBirth?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (accessToken, refreshToken, user) => {
        Cookies.set('rydo_access_token', accessToken, { expires: 1 });
        Cookies.set('rydo_refresh_token', refreshToken, { expires: 7 });
        set({ accessToken, refreshToken, user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = response.data;
          get().setTokens(accessToken, refreshToken, user);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register', data);
          return response.data;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (userId, otp) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/verify-otp', { userId, otp });
          const { accessToken, refreshToken, user } = response.data;
          get().setTokens(accessToken, refreshToken, user);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        Cookies.remove('rydo_access_token');
        Cookies.remove('rydo_refresh_token');
        apiClient.post('/auth/logout').catch(() => {});
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh, user } = response.data;
        get().setTokens(newAccess, newRefresh, user);
      },
    }),
    {
      name: 'rydo-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
