'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getBackendOrigin } from '@/utils/getBackendOrigin';

export function useServerDatetime(): string | null {
  const [datetime, setDatetime] = useState<string | null>(null);

  useEffect(() => {
    const socket: Socket = io(`${getBackendOrigin()}/api/datetime`, {
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('datetime', (value: string) => {
      setDatetime(value);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return datetime;
}
