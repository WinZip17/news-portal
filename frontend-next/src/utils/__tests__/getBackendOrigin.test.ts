import { getBackendOrigin } from '@/utils/getBackendOrigin';

describe('getBackendOrigin', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

  it('uses NEXT_PUBLIC_BACKEND_URL when set', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.example.com/';
    expect(getBackendOrigin()).toBe('https://api.example.com');
  });

  it('falls back to localhost backend or current origin without env', () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    const result = getBackendOrigin();
    expect(['http://localhost:3001', window.location.origin]).toContain(result);
  });
});
