/** Обрезает текст с «…» только если он длиннее limit. */
export function truncateText(text: string | undefined | null, limit: number): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit).trimEnd()}…`;
}
