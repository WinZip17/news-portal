'use client';
import './globals.css';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store, useAppSelector, useAppDispatch, setTheme } from '@/store';
import { fetchCurrentUser } from '@/store/auth/authSlice';
import { lightTheme, darkTheme } from '@/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import MainLayout from '@/components/MainLayout';
import NewsNotifications from '@/components/NewsNotifications';
import DateLocalizationProvider from '@/components/DateLocalizationProvider';
import YandexMetrika from '@/components/YandexMetrika';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((s) => s.ui.theme);
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <DateLocalizationProvider>
        <MainLayout>{children}</MainLayout>
        <NewsNotifications />
      </DateLocalizationProvider>
    </ThemeProvider>
  );
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (accessToken) dispatch(fetchCurrentUser());
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (user?.preferences?.theme) {
      dispatch(setTheme(user.preferences.theme));
    }
  }, [user]);
  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppRouterCacheProvider>
        <AuthInit>
          <ThemeWrapper>{children}</ThemeWrapper>
          <YandexMetrika />
        </AuthInit>
      </AppRouterCacheProvider>
    </Provider>
  );
}
