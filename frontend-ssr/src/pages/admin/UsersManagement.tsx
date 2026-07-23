import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Switch,
  Input,
  message,
  Popconfirm,
} from 'antd';
import { TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  preferences?: { theme?: string };
  createdAt: string;
  lastLoginAt?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users', { params: { page, limit: 20 } });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      message.error('Ошибка загрузки');
    }
    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      await api.put(`/auth/users/${editUser.id}`, {
        email: editUser.email,
        username: editUser.username,
        role: editUser.role,
        isActive: editUser.isActive,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        preferences: editUser.preferences,
      });
      message.success('Сохранено');
      setModalVisible(false);
      loadUsers();
    } catch {
      message.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/auth/users/${id}`);
      message.success('Удален');
      loadUsers();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'gold',
      admin: 'red',
      moderator: 'orange',
      user: 'blue',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: '👑 Суперадмин',
      admin: 'Админ',
      moderator: 'Модер',
      user: 'Пользователь',
    };
    return labels[role] || role;
  };

  const columns: ColumnsType<User> = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (r: string) => (
        <Tag color={getRoleColor(r)}>{getRoleLabel(r)}</Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (a: boolean) =>
        a ? (
          <Tag color="green">Активен</Tag>
        ) : (
          <Tag color="red">Заблокирован</Tag>
        ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'date',
      width: 110,
      render: (d: string) => new Date(d).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {record.role !== 'super_admin' && (
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>
        <TeamOutlined /> Управление пользователями
      </h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        scroll={{ x: 800 }}
      />

      <Modal
        title="Редактировать пользователя"
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        {editUser && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              addonBefore="Email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />
            <Input
              addonBefore="Username"
              value={editUser.username}
              onChange={(e) =>
                setEditUser({ ...editUser, username: e.target.value })
              }
            />
            <Input
              addonBefore="Имя"
              value={editUser.firstName}
              onChange={(e) =>
                setEditUser({ ...editUser, firstName: e.target.value })
              }
            />
            <Input
              addonBefore="Фамилия"
              value={editUser.lastName}
              onChange={(e) =>
                setEditUser({ ...editUser, lastName: e.target.value })
              }
            />
            <Select
              value={editUser.role}
              onChange={(v) => setEditUser({ ...editUser, role: v })}
              style={{ width: '100%' }}
            >
              <Select.Option value="user">Пользователь</Select.Option>
              <Select.Option value="moderator">Модератор</Select.Option>
              <Select.Option value="admin">Админ</Select.Option>
            </Select>
            <Switch
              checked={editUser.isActive}
              onChange={(c) => setEditUser({ ...editUser, isActive: c })}
              checkedChildren="Активен"
              unCheckedChildren="Заблокирован"
            />
            <Select
              value={editUser.preferences?.theme || 'light'}
              onChange={(v) =>
                setEditUser({
                  ...editUser,
                  preferences: { ...editUser.preferences, theme: v },
                })
              }
              style={{ width: '100%' }}
            >
              <Select.Option value="light">Светлая тема</Select.Option>
              <Select.Option value="dark">Темная тема</Select.Option>
            </Select>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;
