import React, { useMemo, useState } from 'react';
import { Layout, Menu, Switch } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  UserOutlined,
  LoginOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FrameworkSwitcher from '../components/FrameworkSwitcher';

const { Header, Content, Sider } = Layout;

type NavItem = {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    key: 'home',
    path: '/',
    icon: <HomeOutlined />,
    label: 'Главная',
  },
  {
    key: 'news',
    path: '/news',
    icon: <ReadOutlined />,
    label: 'Новости',
  },
  {
    key: 'profile',
    path: '/profile',
    icon: <UserOutlined />,
    label: 'Профиль',
  },
  {
    key: 'login',
    path: '/login',
    icon: <LoginOutlined />,
    label: 'Войти',
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;

    const matched = navItems.find((item) => {
      if (item.path === '/') return currentPath === '/';
      return (
        currentPath === item.path || currentPath.startsWith(`${item.path}/`)
      );
    });

    return matched?.key ?? 'home';
  }, [location.pathname]);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      navItems.map(({ key, icon, label }) => ({
        key,
        icon,
        label,
      })),
    [],
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    console.log('handleMenuClick', key);
    const item = navItems.find((i) => i.key === key);
    console.log('item', item);
    if (item) navigate(item.path);
  };

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
            userSelect: 'none',
          }}
          onClick={() => navigate('/')}
        >
          📰 News Portal
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
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
