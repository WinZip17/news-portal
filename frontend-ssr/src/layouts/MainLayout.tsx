import React, { useMemo, useState } from 'react';
import {
  Layout,
  Menu,
  Switch,
  Avatar,
  Dropdown,
  Space,
  Button,
  Drawer,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FrameworkSwitcher from '../components/FrameworkSwitcher';
import { useUserStore } from '../store/userStoreProvider';
import { useUIStore } from '../store/uiStoreProvider';

const { Header, Content, Sider, Footer } = Layout;

type NavItem = {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
};

const allNavItems: NavItem[] = [
  { key: 'home', path: '/', icon: <HomeOutlined />, label: 'Главная' },
  { key: 'news', path: '/news', icon: <ReadOutlined />, label: 'Новости' },
  {
    key: 'profile',
    path: '/profile',
    icon: <UserOutlined />,
    label: 'Профиль',
    requiresAuth: true,
  },
  {
    key: 'admin',
    path: '/admin',
    icon: <DashboardOutlined />,
    label: 'Админ-панель',
    requiresAdmin: true,
  },
  {
    key: 'login',
    path: '/login',
    icon: <LoginOutlined />,
    label: 'Войти',
    requiresAuth: false,
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.requiresAuth && !isAuthenticated) return false;
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.key === 'login' && isAuthenticated) return false;
      return true;
    });
  }, [isAuthenticated, isAdmin]);

  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    const matched = navItems.find((item) => {
      if (item.path === '/') return currentPath === '/';
      return (
        currentPath === item.path || currentPath.startsWith(`${item.path}/`)
      );
    });
    return matched?.key ?? 'home';
  }, [location.pathname, navItems]);

  const menuItems: MenuProps['items'] = useMemo(
    () => navItems.map(({ key, icon, label }) => ({ key, icon, label })),
    [navItems],
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const item = navItems.find((i) => i.key === key);
    if (item) navigate(item.path);
    setMobileMenuVisible(false);
  };

  const userMenuItems: MenuProps['items'] = isAuthenticated
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Профиль',
          onClick: () => navigate('/profile'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Настройки',
          onClick: () => navigate('/profile'),
        },
        { type: 'divider' },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Выйти',
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: 'Войти',
          onClick: () => navigate('/login'),
        },
      ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Десктопный сайдбар */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          {collapsed ? '📰' : '📰 News Portal'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>

      {/* Мобильное меню */}
      <Drawer
        title="Меню"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        styles={{ body: { padding: 0 } }}
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Layout
        style={{ marginLeft: collapsed ? 0 : 200, transition: 'all 0.2s' }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: theme === 'dark' ? '#001529' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-btn"
              style={{ display: 'none' }}
            />
            <h2 style={{ margin: 0 }}>
              {location.pathname === '/' && 'Главная'}
              {location.pathname === '/news' && 'Новости'}
              {location.pathname === '/profile' && 'Профиль'}
              {location.pathname.startsWith('/admin') && 'Админ панель'}
            </h2>
          </Space>
          <Space size="middle">
            <FrameworkSwitcher />
            <Switch
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size="small"
                />
                <span
                  style={{
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isAuthenticated ? user?.username : 'Гость'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          News Portal ©{new Date().getFullYear()} - Создано с ❤️ и AI
        </Footer>
      </Layout>

      <style>{`
        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
