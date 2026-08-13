/** Origin бэкенда для WebSocket (REST идёт через rewrite /api). */
export function getBackendOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }

  return 'http://localhost:3001';
}
