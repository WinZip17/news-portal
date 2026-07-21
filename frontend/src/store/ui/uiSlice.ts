import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  loading: boolean;
  modalVisible: Record<string, boolean>;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  sidebarCollapsed: false,
  loading: false,
  modalVisible: {},
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setModalVisible: (state, action: PayloadAction<{ modal: string; visible: boolean }>) => {
      state.modalVisible[action.payload.modal] = action.payload.visible;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setLoading,
  setModalVisible,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed;
export const selectLoading = (state: RootState) => state.ui.loading;
export const selectModalVisible = (modal: string) => (state: RootState) =>
  state.ui.modalVisible[modal] || false;
export const selectNotifications = (state: RootState) => state.ui.notifications;

export default uiSlice.reducer;