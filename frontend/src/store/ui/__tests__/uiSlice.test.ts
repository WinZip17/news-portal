import { beforeEach, describe, expect, it } from 'vitest';
import {
  addNotification,
  clearNotifications,
  removeNotification,
  selectLoading,
  selectModalVisible,
  selectNotifications,
  selectSidebarCollapsed,
  selectTheme,
  setLoading,
  setModalVisible,
  setTheme,
  toggleSidebar,
  toggleTheme,
} from '@/store/ui/uiSlice';
import { createTestStore } from '@/test-utils';

describe('uiSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('theme', () => {
    it('toggleTheme switches light to dark and persists to localStorage', () => {
      const store = createTestStore();

      store.dispatch(toggleTheme());

      expect(store.getState().ui.theme).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('toggleTheme switches dark back to light', () => {
      const store = createTestStore({ ui: { theme: 'dark', sidebarCollapsed: false, loading: false, modalVisible: {}, notifications: [] } });

      store.dispatch(toggleTheme());

      expect(store.getState().ui.theme).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('setTheme sets explicit theme', () => {
      const store = createTestStore();

      store.dispatch(setTheme('dark'));

      expect(store.getState().ui.theme).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('sidebar', () => {
    it('toggleSidebar toggles collapsed state', () => {
      const store = createTestStore();

      store.dispatch(toggleSidebar());
      expect(store.getState().ui.sidebarCollapsed).toBe(true);

      store.dispatch(toggleSidebar());
      expect(store.getState().ui.sidebarCollapsed).toBe(false);
    });
  });

  describe('loading', () => {
    it('setLoading updates loading flag', () => {
      const store = createTestStore();

      store.dispatch(setLoading(true));
      expect(store.getState().ui.loading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().ui.loading).toBe(false);
    });
  });

  describe('modals', () => {
    it('setModalVisible tracks modal visibility by name', () => {
      const store = createTestStore();

      store.dispatch(setModalVisible({ modal: 'newsDetail', visible: true }));

      expect(store.getState().ui.modalVisible.newsDetail).toBe(true);
      expect(selectModalVisible('newsDetail')(store.getState())).toBe(true);
      expect(selectModalVisible('other')(store.getState())).toBe(false);
    });
  });

  describe('notifications', () => {
    const notification = {
      id: 'n-1',
      type: 'success' as const,
      message: 'Saved',
      description: 'Changes applied',
    };

    it('addNotification appends notification', () => {
      const store = createTestStore();

      store.dispatch(addNotification(notification));

      expect(store.getState().ui.notifications).toEqual([notification]);
      expect(selectNotifications(store.getState())).toHaveLength(1);
    });

    it('removeNotification removes by id', () => {
      const store = createTestStore({
        ui: {
          theme: 'light',
          sidebarCollapsed: false,
          loading: false,
          modalVisible: {},
          notifications: [notification, { ...notification, id: 'n-2', message: 'Other' }],
        },
      });

      store.dispatch(removeNotification('n-1'));

      expect(store.getState().ui.notifications).toHaveLength(1);
      expect(store.getState().ui.notifications[0]?.id).toBe('n-2');
    });

    it('clearNotifications empties list', () => {
      const store = createTestStore({
        ui: {
          theme: 'light',
          sidebarCollapsed: false,
          loading: false,
          modalVisible: {},
          notifications: [notification],
        },
      });

      store.dispatch(clearNotifications());

      expect(store.getState().ui.notifications).toEqual([]);
    });
  });

  describe('selectors', () => {
    it('selectTheme and selectLoading read ui state', () => {
      const store = createTestStore({
        ui: {
          theme: 'dark',
          sidebarCollapsed: true,
          loading: true,
          modalVisible: {},
          notifications: [],
        },
      });

      expect(selectTheme(store.getState())).toBe('dark');
      expect(selectSidebarCollapsed(store.getState())).toBe(true);
      expect(selectLoading(store.getState())).toBe(true);
    });
  });
});
