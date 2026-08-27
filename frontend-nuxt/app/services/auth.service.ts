import type {
  AuthResponse,
  LoginDto,
  ProfileUpdateData,
  RegisterDto,
  UpdateUserDto,
  UserPreferences,
  UserResponse,
  UsersResponse,
} from '~/types';

export function useAuthService() {
  const { apiFetch, accessToken, refreshToken } = useApi();

  async function register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
    }

    return response;
  }

  async function login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
    }

    return response;
  }

  async function logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      accessToken.value = null;
      refreshToken.value = null;
    }
  }

  async function getCurrentUser(): Promise<UserResponse> {
    return apiFetch<UserResponse>('/auth/me');
  }

  async function updateProfile(data: ProfileUpdateData): Promise<UserResponse> {
    return apiFetch<UserResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async function updatePreferences(preferences: Partial<UserPreferences>): Promise<UserResponse> {
    return apiFetch<UserResponse>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async function getUsers(): Promise<UsersResponse> {
    return apiFetch<UsersResponse>('/auth/users');
  }

  async function updateUser(id: string, data: UpdateUserDto): Promise<UserResponse> {
    return apiFetch<UserResponse>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async function deleteUser(id: string): Promise<void> {
    return apiFetch(`/auth/users/${id}`, { method: 'DELETE' });
  }

  return {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    updatePreferences,
    getUsers,
    updateUser,
    deleteUser,
  };
}
