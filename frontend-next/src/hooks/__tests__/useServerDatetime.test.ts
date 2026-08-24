import { renderHook, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useServerDatetime } from '@/hooks/useServerDatetime';

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../../utils/getBackendOrigin', () => ({
  getBackendOrigin: () => 'http://localhost:3001',
}));

const ioMock = io as jest.MockedFunction<typeof io>;

describe('useServerDatetime', () => {
  beforeEach(() => {
    ioMock.mockReturnValue({
      on: jest.fn((event: string, callback: (value: string) => void) => {
        if (event === 'datetime') {
          callback('23.08.2026 14:42:00');
        }
      }),
      disconnect: jest.fn(),
    } as never);
  });

  it('connects to datetime socket and returns server time', async () => {
    const { result } = renderHook(() => useServerDatetime());

    await waitFor(() => {
      expect(result.current).toBe('23.08.2026 14:42:00');
    });

    expect(ioMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/datetime',
      expect.objectContaining({ path: '/api/socket.io' }),
    );
  });

  it('disconnects socket on unmount', () => {
    const disconnect = jest.fn();
    ioMock.mockReturnValue({
      on: jest.fn(),
      disconnect,
    } as never);

    const { unmount } = renderHook(() => useServerDatetime());
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
