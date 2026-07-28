export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    politics: 'blue',
    economy: 'green',
    technology: 'purple',
    science: 'cyan',
    sports: 'orange',
    entertainment: 'magenta',
    health: 'red',
    world: 'geekblue',
    other: 'default',
  };
  return colors[category] || 'default';
};
