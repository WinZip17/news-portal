import React, { useEffect } from 'react';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { Provider } from 'react-redux';
import { store, useAppSelector, selectTheme } from './store';
import { useAuth } from './hooks/useAuth';
import ruRU from 'antd/locale/ru_RU';

const { Header, Content, Footer } = Layout;

const AppContent: React.FC = () => {
    const theme = useAppSelector(selectTheme);
    const { user, isAuthenticated, fetchCurrentUser } = useAuth();

    useEffect(() => {
        // При загрузке приложения проверяем авторизацию
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
            <Layout style={{ minHeight: '100vh' }}>
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                        📰 News Portal
                    </div>
                    <div style={{ color: 'white' }}>
                        {isAuthenticated && user ? (
                            <span>👋 Привет, {user.username}!</span>
                        ) : (
                            <span>Гость</span>
                        )}
                    </div>
                </Header>

                <Content style={{ padding: '24px 50px' }}>
                    <div
                        style={{
                            background: theme === 'dark' ? '#141414' : '#fff',
                            padding: 24,
                            minHeight: 280,
                            borderRadius: 8,
                        }}
                    >
                        <h1>Добро пожаловать на News Portal!</h1>
                        <p>Ваш персонализированный источник новостей с AI-генерацией контента.</p>

                        {isAuthenticated ? (
                            <div style={{ marginTop: 16 }}>
                                <h3>Ваши настройки:</h3>
                                <pre>{JSON.stringify(user?.preferences, null, 2)}</pre>
                            </div>
                        ) : (
                            <div style={{ marginTop: 16 }}>
                                <p>Войдите в систему для персонализации новостной ленты</p>
                            </div>
                        )}
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    News Portal ©{new Date().getFullYear()} - Создано с ❤️ и AI
                </Footer>
            </Layout>
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