'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  NEWS_WS_EVENTS,
  NewsStatus,
  UserRole,
  type NewsNotificationPayload,
} from '@news-portal/types';
import { useAppSelector } from '@/store';
import { getBackendOrigin } from '@/utils/getBackendOrigin';

export type NewsNotificationKind = 'published' | 'pending';

export interface NewsNotificationItem {
  id: string;
  kind: NewsNotificationKind;
  title: string;
  payload: NewsNotificationPayload;
  count?: number;
}

const BATCH_DELAY_MS = 5000;

const MODERATOR_ROLES = new Set<string>([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

const EMPTY_BATCHES: Record<NewsNotificationKind, NewsNotificationItem[]> = {
  published: [],
  pending: [],
};

function isModeratorRole(role?: string): boolean {
  return !!role && MODERATOR_ROLES.has(role);
}

function createNotificationItem(
  kind: NewsNotificationKind,
  payload: NewsNotificationPayload,
): NewsNotificationItem {
  return {
    id: `${payload.id}-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title: payload.title,
    payload,
  };
}

function createBatchNotification(
  kind: NewsNotificationKind,
  items: NewsNotificationItem[],
): NewsNotificationItem {
  const latest = items[items.length - 1];

  return {
    id: `batch-${kind}-${Date.now()}`,
    kind,
    title: latest.title,
    payload: latest.payload,
    count: items.length,
  };
}

export function useNewsNotifications(enabled = true) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const [notifications, setNotifications] = useState<NewsNotificationItem[]>([]);

  const batchBuffersRef = useRef<Record<NewsNotificationKind, NewsNotificationItem[]>>({
    published: [],
    pending: [],
  });
  const batchTimersRef = useRef<Record<NewsNotificationKind, ReturnType<typeof setTimeout> | null>>(
    {
      published: null,
      pending: null,
    },
  );

  const flushBatch = useCallback((kind: NewsNotificationKind) => {
    const items = batchBuffersRef.current[kind];
    batchBuffersRef.current[kind] = [];
    batchTimersRef.current[kind] = null;

    if (items.length === 0) return;

    const notification = items.length === 1 ? items[0] : createBatchNotification(kind, items);

    setNotifications((prev) => [...prev, notification]);
  }, []);

  const scheduleNotification = useCallback(
    (item: NewsNotificationItem) => {
      const kind = item.kind;
      batchBuffersRef.current[kind].push(item);

      if (batchTimersRef.current[kind]) return;

      batchTimersRef.current[kind] = setTimeout(() => {
        flushBatch(kind);
      }, BATCH_DELAY_MS);
    },
    [flushBatch],
  );

  const dismiss = useCallback(() => {
    setNotifications((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    return () => {
      (Object.keys(batchTimersRef.current) as NewsNotificationKind[]).forEach((kind) => {
        const timerId = batchTimersRef.current[kind];
        if (timerId) clearTimeout(timerId);
      });
      batchBuffersRef.current = { ...EMPTY_BATCHES };
      batchTimersRef.current = { published: null, pending: null };
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const socket: Socket = io(`${getBackendOrigin()}/api/news`, {
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      auth: accessToken ? { token: accessToken } : undefined,
    });

    socket.on(NEWS_WS_EVENTS.PUBLISHED, (payload: NewsNotificationPayload) => {
      if (payload.status !== NewsStatus.PUBLISHED) return;
      scheduleNotification(createNotificationItem('published', payload));
    });

    socket.on(NEWS_WS_EVENTS.PENDING, (payload: NewsNotificationPayload) => {
      if (!isModeratorRole(userRole)) return;
      scheduleNotification(createNotificationItem('pending', payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, accessToken, userRole, scheduleNotification]);

  return {
    notification: notifications[0] ?? null,
    dismiss,
  };
}
