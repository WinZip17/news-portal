import React, { useState } from 'react';
import { Layout, Menu, Switch } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  UserOutlined,
  LoginOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import FrameworkSwitcher from '../components/FrameworkSwitcher';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            color: 'white',
            padding: 16,
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => (window.location.href = '/')}
        >
          📰 News Portal
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: 'Главная',
              onClick: () => (window.location.href = '/'),
            },
            {
              key: '2',
              icon: <ReadOutlined />,
              label: 'Новости',
              onClick: () => (window.location.href = '/news'),
            },
            {
              key: '3',
              icon: <UserOutlined />,
              label: 'Профиль',
              onClick: () => (window.location.href = '/profile'),
            },
            {
              key: '4',
              icon: <LoginOutlined />,
              label: 'Войти',
              onClick: () => (window.location.href = '/login'),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: theme === 'dark' ? '#141414' : '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <FrameworkSwitcher />
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            checked={theme === 'dark'}
            onChange={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
