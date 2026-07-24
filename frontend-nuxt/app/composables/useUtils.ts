export function useUtils() {
  function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      full: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
    }[format];

    return dateObj.toLocaleDateString('ru-RU', options);
  }

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      politics: 'Политика',
      economy: 'Экономика',
      technology: 'Технологии',
      science: 'Наука',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      health: 'Здоровье',
      world: 'Мир',
      other: 'Другое',
    };
    return labels[category] || category;
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      pending: 'На проверке',
      published: 'Опубликовано',
      rejected: 'Отклонено',
      archived: 'В архиве',
    };
    return labels[status] || status;
  }

  function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      user: 'Пользователь',
      moderator: 'Модератор',
      admin: 'Администратор',
      super_admin: 'Супер-админ',
    };
    return labels[role] || role;
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  function getInitials(firstName?: string, lastName?: string, username?: string): string {
    const first = firstName?.[0] || username?.[0] || '?';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  }

  return {
    formatDate,
    getCategoryLabel,
    getStatusLabel,
    getRoleLabel,
    truncateText,
    getInitials,
  };
}
