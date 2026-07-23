import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';

export interface UIState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export type UIStore = StoreApi<UIState>;

export const createUIStore = (): UIStore =>
  createStore<UIState>()((set) => ({
    theme: 'dark',
    setTheme: (theme) => set({ theme }),
  }));
