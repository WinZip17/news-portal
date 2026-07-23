export const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    politics: 'Политика',
    economy: 'Экономика',
    technology: 'Технологии',
    science: 'Наука',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    health: 'Здоровье',
    world: 'Мир',
  };
  return labels[cat] || cat;
};
