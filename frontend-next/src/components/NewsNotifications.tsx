'use client';

import { Alert, Button, Snackbar } from '@mui/material';
import Link from 'next/link';
import { useNewsNotifications } from '@/hooks/useNewsNotifications';
import { truncateText } from '@/utils/truncateText';

function formatNotificationMessage(
  kind: 'published' | 'pending',
  title: string,
  count = 1,
): string {
  if (count > 1) {
    return kind === 'pending'
      ? `Новостей на модерации: ${count}`
      : `Опубликовано новостей: ${count}`;
  }

  return kind === 'pending'
    ? `Новость на модерации: ${truncateText(title, 80)}`
    : `Опубликована новость: ${truncateText(title, 80)}`;
}

export default function NewsNotifications() {
  const { notification, dismiss } = useNewsNotifications();

  const href = notification?.kind === 'pending' ? '/admin' : '/news';
  const message = notification
    ? formatNotificationMessage(notification.kind, notification.title, notification.count ?? 1)
    : '';

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={8000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        dismiss();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ mb: 2, mr: 2 }}
    >
      <Alert
        severity={notification?.kind === 'pending' ? 'warning' : 'info'}
        variant="filled"
        onClose={dismiss}
        sx={{ width: '100%', maxWidth: 360, alignItems: 'center' }}
        action={
          <Button color="inherit" size="small" component={Link} href={href} onClick={dismiss}>
            Открыть
          </Button>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
