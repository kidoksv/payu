'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token?: string;
  adminToken?: string;
  email?: string;
  setAuth: (token: string, email?: string) => void;
  setAdminAuth: (token: string, email?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      setAuth: (token, email) => set({ token, email }),
      setAdminAuth: (adminToken, email) => set({ adminToken, email }),
      logout: () => set({ token: undefined, adminToken: undefined, email: undefined })
    }),
    { name: 'payu-auth' }
  )
);
