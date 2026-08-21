import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNewsModal } from '@/hooks/useNewsModal.ts';
import { renderHookWithProviders } from '@/test-utils';

describe('useNewsModal', () => {
  it('opens modal from ?news= query param on mount', async () => {
    const { result } = renderHookWithProviders(() => useNewsModal(), {
      route: '/?news=news-42',
    });

    await waitFor(() => {
      expect(result.current.modalVisible).toBe(true);
      expect(result.current.selectedNewsId).toBe('news-42');
    });
  });

  it('openNews sets modal state and selected id', async () => {
    const { result } = renderHookWithProviders(() => useNewsModal());

    act(() => {
      result.current.openNews('news-99');
    });

    expect(result.current.modalVisible).toBe(true);
    expect(result.current.selectedNewsId).toBe('news-99');
  });

  it('closeNews hides modal and clears selected id', async () => {
    const { result } = renderHookWithProviders(() => useNewsModal(), {
      route: '/?news=news-42',
    });

    await waitFor(() => {
      expect(result.current.modalVisible).toBe(true);
    });

    act(() => {
      result.current.closeNews();
    });

    expect(result.current.modalVisible).toBe(false);
    expect(result.current.selectedNewsId).toBeNull();
  });
});
