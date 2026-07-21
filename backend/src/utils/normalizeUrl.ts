export const normalizeUrl = (url: string): string => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('?')[0]
    .split('#')[0];
};
