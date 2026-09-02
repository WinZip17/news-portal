import { renderHook, act } from '@testing-library/react';
import { formatLocalDatetime, useServerDatetime } from '@/hooks/useServerDatetime';

describe('formatLocalDatetime', () => {
  it('formats date using local timezone fields', () => {
    const date = new Date(2026, 7, 23, 14, 42, 5);
    expect(formatLocalDatetime(date)).toBe('23.08.2026 14:42:05');
  });
});

describe('useServerDatetime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 23, 14, 42, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns local time and updates every second', () => {
    const { result } = renderHook(() => useServerDatetime());

    expect(result.current).toBe('23.08.2026 14:42:00');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('23.08.2026 14:42:01');
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useServerDatetime());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
