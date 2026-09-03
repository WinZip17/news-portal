export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    politics: 'blue',
    economy: 'green',
    technology: 'purple',
    science: 'cyan',
    sports: 'orange',
    entertainment: 'pink',
    health: 'red',
    world: 'indigo',
    other: 'grey'
  };
  return colors[category] || 'grey';
}
