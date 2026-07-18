import { useCallback } from 'react';
import {
  login,
  register,
  logout,
  fetchCurrentUser,
  updateProfile,
  updatePreferences,
  clearAuthError,
  useAppDispatch,
  useAppSelector,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../store';
import { LoginCredentials, RegisterData, User } from '../types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(login(credentials)).unwrap();
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      return dispatch(register(data)).unwrap();
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleFetchCurrentUser = useCallback(() => {
    return dispatch(fetchCurrentUser()).unwrap();
  }, [dispatch]);

  const handleUpdateProfile = useCallback(
    (data: Partial<User>) => {
      return dispatch(updateProfile(data)).unwrap();
    },
    [dispatch]
  );

  const handleUpdatePreferences = useCallback(
    (preferences: any) => {
      return dispatch(updatePreferences(preferences)).unwrap();
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    fetchCurrentUser: handleFetchCurrentUser,
    updateProfile: handleUpdateProfile,
    updatePreferences: handleUpdatePreferences,
    clearError: handleClearError,
  };
};