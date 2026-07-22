import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Switch, Drawer } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  SettingOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled,
  DashboardOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/hooks/useAuth.ts';
import { toggleTheme, useAppDispatch, useAppSelector } from '@/store';

const { Header, Sider, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Основные пункты меню
  const mainMenuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Главная',
    },
    {
      key: '/news',
      icon: <ReadOutlined />,
      label: 'Новости',
    },
    ...(isAuthenticated
      ? [
          {
            key: '/profile',
            icon: <UserOutlined />,
            label: 'Профиль',
          },
          ...(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'super_admin'
            ? [
                {
                  key: '/admin',
                  icon: <DashboardOutlined />,
                  label: 'Админ панель',
                },
              ]
            : []),
        ]
      : []),
  ];

  // Меню пользователя
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
          onClick: () => navigate('/settings'),
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
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/admin']}
          items={mainMenuItems}
          onClick={({ key }) => {
            navigate(key);
            setMobileMenuVisible(false);
          }}
        />
      </Sider>

      {/* Мобильное меню */}
      <Drawer
        title="Меню"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        styles={{ body: { padding: 0, width: 250 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/admin']}
          items={mainMenuItems}
          onClick={({ key }) => {
            navigate(key);
            setMobileMenuVisible(false);
          }}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: 'all 0.2s' }}>
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
            <Switch
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
              checked={theme === 'dark'}
              onChange={() => dispatch(toggleTheme())}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user?.avatar} icon={!user?.avatar && <UserOutlined />} size="small" />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{isAuthenticated ? user?.username : 'Гость'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center' }}>News Portal ©{new Date().getFullYear()} - Создано с ❤️ и AI</Footer>
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
