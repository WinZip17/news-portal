'use client';

import { useEffect, useState } from 'react';

/** Формат: DD.MM.YYYY HH:mm:ss в локальном часовом поясе браузера */
export function formatLocalDatetime(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function useServerDatetime(): string | null {
  const [datetime, setDatetime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setDatetime(formatLocalDatetime());
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return datetime;
}
