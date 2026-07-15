import React, { useEffect } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme as antTheme } from 'antd';
import { Provider } from 'react-redux';
import { store, useAppSelector, selectTheme } from './store';
import { useAuth } from './hooks/useAuth';
import AppErrorBoundary from './components/common/ErrorBoundary';
import { routes } from './config/routes';
import ruRU from 'antd/locale/ru_RU';

const AppRoutes: React.FC = () => {
    const element = useRoutes(routes);
    return element;
};

const AppContent: React.FC = () => {
    const theme = useAppSelector(selectTheme);
    const { fetchCurrentUser, isAuthenticated } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !isAuthenticated) {
            fetchCurrentUser();
        }
    }, []);

    return (
        <ConfigProvider
            locale={ruRU}
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
                        <AppRoutes />
                    </Router>
                </AppErrorBoundary>
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