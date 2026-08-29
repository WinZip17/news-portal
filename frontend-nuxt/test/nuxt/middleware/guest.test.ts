import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import guestMiddleware from '~/middleware/guest';
import { useAuthStore } from '~/stores/auth';
import { getTestMocks } from '../helpers/mocks';
import { mockUser } from '../../fixtures/mocks';

const mocks = getTestMocks();

const from = { path: '/' };

describe('guest middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mocks.navigateToMock.mockReset();
  });

  it('redirects authenticated users to home', () => {
    const store = useAuthStore();
    store.user = mockUser;
    store.isAuthenticated = true;

    guestMiddleware({ path: '/login' } as never, from as never);

    expect(mocks.navigateToMock).toHaveBeenCalledWith('/');
  });

  it('allows guests to access login page', () => {
    guestMiddleware({ path: '/login' } as never, from as never);

    expect(mocks.navigateToMock).not.toHaveBeenCalled();
  });
});
