import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
  };
}

export interface UserState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export type UserStore = StoreApi<UserState>;

export const createUserStore = (): UserStore =>
  createStore<UserState>()((set) => ({
    user: null,
    loading: false,
    isAuthenticated: false,

    fetchUser: async () => {
      set({ loading: true });
      try {
        const res = await api.get<User>('/auth/me');
        set({ user: res.data, isAuthenticated: true, loading: false });
      } catch {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    },

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
    },
  }));
