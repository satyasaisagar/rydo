'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socket';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (user && accessToken) {
      socketService.connect(user.id);
    } else {
      socketService.disconnect();
    }
    return () => { /* Keep socket alive across page nav */ };
  }, [user, accessToken]);

  return <>{children}</>;
}
