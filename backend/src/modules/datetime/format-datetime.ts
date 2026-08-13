const pad = (value: number): string => String(value).padStart(2, '0');

/** Формат: DD.MM.YYYY HH:mm:ss */
export function formatCurrentDatetime(date = new Date()): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
