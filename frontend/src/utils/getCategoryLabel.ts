export const getCategoryLabel = (category: string) => {
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
};