import React from 'react';
import { ConfigProvider, Layout, Menu } from 'antd';
import { Provider } from 'react-redux';
import { store } from './store';
import ruRU from 'antd/locale/ru_RU';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
      <Provider store={store}>
        <ConfigProvider
            locale={ruRU}
            theme={{
              token: {
                colorPrimary: '#1677ff',
              },
            }}
        >
          <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
              <div className="demo-logo" style={{ color: 'white', fontSize: '20px', marginRight: '20px' }}>
                News Portal
              </div>
              <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['1']}
                  items={[
                    { key: '1', label: 'Главная' },
                    { key: '2', label: 'Новости' },
                    { key: '3', label: 'Войти' },
                  ]}
              />
            </Header>
            <Content style={{ padding: '0 50px' }}>
              <div style={{ background: '#fff', padding: 24, minHeight: 280, marginTop: 20 }}>
                <h1>Добро пожаловать на News Portal</h1>
                <p>Ваш источник актуальных новостей</p>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              News Portal ©{new Date().getFullYear()} Created with ❤️
            </Footer>
          </Layout>
        </ConfigProvider>
      </Provider>
  );
};

export default App;