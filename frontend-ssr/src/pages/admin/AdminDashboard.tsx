import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import NewsManagement from './NewsManagement';
import UsersManagement from './UsersManagement';
import SuperAdminPanel from './SuperAdminPanel';
import api from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    api
      .get('/auth/me')
      .then((r) => {
        setIsSuperAdmin(r.data.role === 'super_admin');
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

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
