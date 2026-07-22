import React from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import NewsManagement from './NewsManagement';
import UsersManagement from './UsersManagement';
import SuperAdminPanel from './SuperAdminPanel';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const items = [
    {
      key: 'news',
      label: (
        <span>
          <ReadOutlined /> Управление новостями
        </span>
      ),
      children: <NewsManagement />,
    },
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined /> Пользователи
        </span>
      ),
      children: <UsersManagement />,
    },
  ];

  if (isSuperAdmin) {
    items.push({
      key: 'super',
      label: (
        <span>
          <CrownOutlined style={{ color: 'gold' }} /> Панель суперадмина
        </span>
      ),
      children: <SuperAdminPanel />,
    });
  }

  return (
    <div>
      <h1>Админ-панель</h1>
      <Tabs defaultActiveKey="news" items={items} />
    </div>
  );
};

export default AdminDashboard;
