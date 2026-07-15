import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme as antTheme } from 'antd';
import { Provider } from 'react-redux';
import { store, useAppSelector, selectTheme } from './store';
import { useAuth } from './hooks/useAuth';
import ruRU from 'antd/locale/ru_RU';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewsList from './pages/NewsList';

const AppContent: React.FC = () => {
    const theme = useAppSelector(selectTheme);
    const { fetchCurrentUser, isAuthenticated } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !isAuthenticated) {
            fetchCurrentUser();
        }
    }, []);

    // Правильное использование темы Ant Design
    const themeConfig = useMemo(() => ({
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#1677ff',
        },
    }), [theme]);

    return (
        <ConfigProvider
            locale={ruRU}
            theme={themeConfig}
        >
            <AntApp>
                <Router>
                    <Routes>
                        {/* Публичные роуты (авторизация) */}
                        <Route element={<AuthLayout />}>
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />
                        </Route>

                        {/* Основные роуты */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/news" element={<NewsList />} />
                            <Route path="/news/:id" element={<div>Детальная новость</div>} />

                            {/* Защищенные роуты */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <div>Профиль</div>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <div>Настройки</div>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Админ роуты */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requiredRoles={['admin', 'moderator']}>
                                        <div>Админ панель</div>
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

                        {/* 404 */}
                        <Route path="*" element={<div>Страница не найдена</div>} />
                    </Routes>
                </Router>
            </AntApp>
        </ConfigProvider>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
};

export default App;