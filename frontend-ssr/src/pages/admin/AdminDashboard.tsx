import React from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import NewsManagement from './NewsManagement';
import UsersManagement from './UsersManagement';
import SuperAdminPanel from './SuperAdminPanel';
import { useUserStore } from '../../store/userStoreProvider';
import { UserRole } from '../../types';

const AdminDashboard: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

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
          <CrownOutlined style={{ color: 'gold' }} /> Суперадмин
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
