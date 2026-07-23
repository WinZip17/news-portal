'use client';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store, useAppSelector, useAppDispatch, setTheme } from '@/store';
import { fetchCurrentUser } from '@/store/auth/authSlice';
import { lightTheme, darkTheme } from '@/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import MainLayout from '@/components/MainLayout';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((s) => s.ui.theme);
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <MainLayout>{children}</MainLayout>
    </ThemeProvider>
  );
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(fetchCurrentUser());
  }, []);

  useEffect(() => {
    if (user?.preferences?.theme) {
      dispatch(setTheme(user.preferences.theme));
    }
  }, [user]);
  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Provider store={store}>
          <AppRouterCacheProvider>
            <AuthInit>
              <ThemeWrapper>{children}</ThemeWrapper>
            </AuthInit>
          </AppRouterCacheProvider>
        </Provider>
      </body>
    </html>
  );
}
