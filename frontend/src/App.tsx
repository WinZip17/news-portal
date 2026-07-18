import React, { useEffect } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme as antTheme, message } from 'antd';
import { Provider } from 'react-redux';
import { store, useAppSelector, selectTheme, setTheme } from './store';
import { useAuth } from './hooks/useAuth';
import AppErrorBoundary from './components/common/ErrorBoundary';
import { routes } from './config/routes';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';

const AppRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const AppContent: React.FC = () => {
  const theme = useAppSelector(selectTheme);
  const { fetchCurrentUser, isAuthenticated, logout, clearError, user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      fetchCurrentUser()
        .catch((error: any) => {
          // Если ошибка 401 (Unauthorized) — токен недействителен
          if (error?.status === 401 || error?.response?.status === 401) {
            logout();
            message.error('Сессия истекла. Пожалуйста, войдите снова.');
          } else {
            console.error('Ошибка при получении пользователя:', error);
            message.error('Не удалось загрузить профиль. Проверьте подключение.');
          }
          clearError();
        });
    }
  }, []);

  useEffect(() => {
    if (user?.preferences?.theme) {
      const userTheme = user.preferences.theme;
      const currentTheme = localStorage.getItem('theme');
      if (userTheme !== currentTheme) {
        store.dispatch(setTheme(userTheme));
      }
    }
  }, [user]);

  const getLocale = (lang: string) => lang === 'ru' ? ruRU : enUS;

  return (
    <ConfigProvider
      locale={getLocale(user?.preferences?.language || 'ru')}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntApp>
        <AppErrorBoundary>
          <Router>
            <AppRoutes/>
          </Router>
        </AppErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent/>
    </Provider>
  );
};

export default App;