export type DateFormatStyle = 'relative' | 'short';

export function formatDate(date?: string | Date | null, style: DateFormatStyle = 'short'): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'relative') {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ч. назад`;

    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return d.toLocaleDateString('ru-RU');
}
