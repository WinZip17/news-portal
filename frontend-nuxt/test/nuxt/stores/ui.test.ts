import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUIStore } from '~/stores/ui';

describe('ui store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.documentElement.classList.remove('p-dark');
  });

  it('toggleTheme switches between light and dark', () => {
    const store = useUIStore();
    expect(store.theme).toBe('light');

    store.toggleTheme();
    expect(store.theme).toBe('dark');
    expect(document.documentElement.classList.contains('p-dark')).toBe(true);

    store.toggleTheme();
    expect(store.theme).toBe('light');
    expect(document.documentElement.classList.contains('p-dark')).toBe(false);
  });

  it('setTheme applies explicit theme', () => {
    const store = useUIStore();

    store.setTheme('dark');
    expect(store.theme).toBe('dark');
    expect(document.documentElement.classList.contains('p-dark')).toBe(true);

    store.setTheme('light');
    expect(store.theme).toBe('light');
  });

  it('setServerTheme initializes theme from SSR value', () => {
    const store = useUIStore();

    store.setServerTheme('dark');
    expect(store.theme).toBe('dark');
  });
});
