export const getTimeAgoString = (dateString: string) => {
  const d = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'только что';
  if (diff < 60) return `${diff} мин. назад`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
  if (diff < 10080) return `${Math.floor(diff / 1440)} дн. назад`;
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatFullDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatLocaleDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');
