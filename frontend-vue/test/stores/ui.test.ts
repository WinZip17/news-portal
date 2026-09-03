import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUIStore } from '@/stores/ui';

describe('ui store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('toggles theme and persists to localStorage', () => {
    const store = useUIStore();

    expect(store.theme).toBe('light');
    store.toggleTheme();
    expect(store.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(store.isDark).toBe(true);
  });

  it('setTheme applies explicit theme', () => {
    const store = useUIStore();

    store.setTheme('dark');
    expect(store.theme).toBe('dark');
    store.setTheme('light');
    expect(store.theme).toBe('light');
  });

  it('manages notifications', () => {
    const store = useUIStore();

    store.addNotification({ id: '1', type: 'success', message: 'OK' });
    expect(store.notifications).toHaveLength(1);

    store.removeNotification('1');
    expect(store.notifications).toHaveLength(0);
  });
});
