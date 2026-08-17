// Типы для форматирования дат
import type { NewsFilter } from '~/types';

type DateFormatOption = {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
};

const DATE_FORMAT_OPTIONS: Record<string, DateFormatOption> = {
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
};

export function useUtils() {
  function formatDate(
    date: string | Date,
    format: keyof typeof DATE_FORMAT_OPTIONS = 'short',
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ru-RU', DATE_FORMAT_OPTIONS[format]);
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

  function formatAppliedFilters(filters: NewsFilter): string {
    const parts: string[] = [];
    if (filters.search) parts.push(`поиск: «${filters.search}»`);
    if (filters.category) parts.push(getCategoryLabel(filters.category));
    if (filters.tags?.length) parts.push(`теги: ${filters.tags.join(', ')}`);
    if (filters.isAiGenerated === true) parts.push('только AI');
    if (filters.isAiGenerated === false) parts.push('без AI');
    if (filters.fromDate || filters.toDate) parts.push('за период');
    return parts.join(' · ');
  }

  return {
    formatDate,
    getCategoryLabel,
    getStatusLabel,
    getRoleLabel,
    truncateText,
    getInitials,
    formatAppliedFilters,
  };
}
