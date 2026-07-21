import React from 'react';
import { Tabs } from 'antd';
import { ReadOutlined, TeamOutlined } from '@ant-design/icons';
import NewsManagement from '@/pages/admin/NewsManagement.tsx'
import UsersManagement from '@/pages/admin/UsersManagement.tsx'

const AdminDashboard: React.FC = () => {
  const items = [
    {
      key: 'news',
      label: (
        <span>
          <ReadOutlined/> Управление новостями
        </span>
      ),
      children: <NewsManagement/>,
    },
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined/> Пользователи
        </span>
      ),
      children: <UsersManagement/>,
    },
  ];

  return (
    <div>
      <h1>Админ-панель</h1>
      <Tabs defaultActiveKey="news" items={items}/>
    </div>
  );
};

export default AdminDashboard;