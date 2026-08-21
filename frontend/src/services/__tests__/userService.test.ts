import { describe, expect, it } from 'vitest';
import { UserRole } from '@/types';
import { userService } from '@/services/userService.ts';
import { mockUser, mockUsersResponse } from '@/test-utils/msw/handlers';

describe('userService (MSW)', () => {
  it('fetches users list with pagination', async () => {
    const response = await userService.getUsers(1, 20);

    expect(response.total).toBe(mockUsersResponse.total);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]?.email).toBe(mockUser.email);
  });

  it('updates user by id', async () => {
    const user = await userService.updateUser('user-42', {
      firstName: 'Admin',
      role: UserRole.ADMIN,
    });

    expect(user.id).toBe('user-42');
    expect(user.firstName).toBe('Admin');
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('deletes user by id', async () => {
    await expect(userService.deleteUser('user-42')).resolves.toBeUndefined();
  });
});
