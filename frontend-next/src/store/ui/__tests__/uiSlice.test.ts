import { createTestStore } from '@/test-utils/renderWithProviders';
import { setTheme, toggleTheme } from '@/store/ui/uiSlice';

describe('uiSlice', () => {
  it('starts with dark theme', () => {
    const store = createTestStore();
    expect(store.getState().ui.theme).toBe('dark');
  });

  it('toggleTheme switches between light and dark', () => {
    const store = createTestStore();

    store.dispatch(toggleTheme());
    expect(store.getState().ui.theme).toBe('light');

    store.dispatch(toggleTheme());
    expect(store.getState().ui.theme).toBe('dark');
  });

  it('setTheme sets explicit theme', () => {
    const store = createTestStore();

    store.dispatch(setTheme('light'));
    expect(store.getState().ui.theme).toBe('light');
  });
});
