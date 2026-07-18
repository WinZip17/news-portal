import React, { useEffect, useState } from 'react';
import {Table, Tag, Button, Space, Modal, Select, Switch, message, Popconfirm, Input} from 'antd';
import { TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types/auth';
import type { ColumnsType } from 'antd/es/table';

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
            const response = await userService.getUsers(page);
            setUsers(response.data);
            setTotal(response.total);
        } catch (error) {
            message.error('Ошибка загрузки пользователей');
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
            await userService.updateUser(editUser.id, {
                email: editUser.email,
                username: editUser.username,
                firstName: editUser.firstName,
                lastName: editUser.lastName,
                role: editUser.role,
                isActive: editUser.isActive,
                preferences: editUser.preferences,
            });
            message.success('Пользователь обновлен');
            setModalVisible(false);
            loadUsers();
        } catch (error) {
            message.error('Ошибка обновления');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await userService.deleteUser(id);
            message.success('Пользователь удален');
            loadUsers();
        } catch (error) {
            message.error('Ошибка удаления');
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'red',
            moderator: 'orange',
            user: 'blue',
        };
        return colors[role] || 'default';
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: 'Админ',
            moderator: 'Модер',
            user: 'Пользователь',
        };
        return labels[role] || role;
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Пользователь',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <span>{record.username}</span>
                    {record.email && <span style={{ color: '#999' }}>({record.email})</span>}
                </Space>
            ),
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role) => <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>,
        },
        {
            title: 'Статус',
            dataIndex: 'isActive',
            key: 'status',
            width: 120,
            render: (active) => active ? <Tag color="green">Активен</Tag> : <Tag color="red">Заблокирован</Tag>,
        },
        {
            title: 'Дата регистрации',
            dataIndex: 'createdAt',
            key: 'date',
            width: 130,
            render: (date) => new Date(date).toLocaleDateString('ru-RU'),
        },
        {
            title: 'Последний вход',
            dataIndex: 'lastLoginAt',
            key: 'login',
            width: 130,
            render: (date) => date ? new Date(date).toLocaleDateString('ru-RU') : '—',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Удалить пользователя?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1>Управление пользователями</h1>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    total,
                    pageSize: 20,
                    onChange: setPage,
                }}
            />

            {/* Модальное окно редактирования */}
            <Modal title="Редактирование пользователя" open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={500}>
                {editUser && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <strong>Email:</strong>
                            <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                        </div>
                        <div>
                            <strong>Имя пользователя:</strong>
                            <Input value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
                        </div>
                        <div>
                            <strong>Имя:</strong>
                            <Input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} />
                        </div>
                        <div>
                            <strong>Фамилия:</strong>
                            <Input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} />
                        </div>
                        <div>
                            <strong>Роль:</strong>
                            <Select value={editUser.role} onChange={(value) => setEditUser({ ...editUser, role: value })} style={{ width: '100%' }}>
                                <Select.Option value="user">Пользователь</Select.Option>
                                <Select.Option value="moderator">Модератор</Select.Option>
                                <Select.Option value="admin">Администратор</Select.Option>
                            </Select>
                        </div>
                        <div>
                            <strong>Активен:</strong>
                            <Switch checked={editUser.isActive} onChange={(checked) => setEditUser({ ...editUser, isActive: checked })} />
                        </div>
                        <div>
                            <strong>Тема:</strong>
                            <Select value={editUser.preferences?.theme || 'light'} onChange={(value) => setEditUser({ ...editUser, preferences: { ...editUser.preferences, theme: value } })} style={{ width: '100%' }}>
                                <Select.Option value="light">Светлая</Select.Option>
                                <Select.Option value="dark">Темная</Select.Option>
                            </Select>
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default UsersManagement;