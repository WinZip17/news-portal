import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import { authService } from '../services/auth.service';
import { User } from '../types';

export interface UserState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
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
        const res = await authService.getMe();
        set({ user: res, isAuthenticated: true, loading: false });
      } catch {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    },

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
      window.location.href = '/';
    },
  }));
