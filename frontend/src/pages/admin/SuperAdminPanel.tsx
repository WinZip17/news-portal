import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Select, message, Popconfirm, Modal, Input, Switch } from 'antd';
import {
  ReadOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  CrownOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { newsService } from '@/services/newsService';
import { userService } from '@/services/userService';
import { News, NewsStatus, NewsCategory } from '@/types/news';
import { User } from '@/types/auth';
import type { ColumnsType } from 'antd/es/table';
import { aiService } from '@/services/aiService.ts'

const { TextArea } = Input;

const SuperAdminPanel: React.FC = () => {
  const [table, setTable] = useState<'news' | 'users'>('news');
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editNews, setEditNews] = useState<News | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'news'>('user');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    table === 'news' ? loadNews() : loadUsers();
  }, [table]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await newsService.getNews({ limit: 100, sortBy: 'createdAt', sortOrder: 'DESC' });
      setNews(response.data);
    } catch {
      message.error('Ошибка загрузки');
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(1, 100);
      setUsers(response.data);
    } catch {
      message.error('Ошибка загрузки');
    }
    setLoading(false);
  };

  const handleDeleteNews = async (id: string) => {
    await newsService.deleteNews(id);
    message.success('Новость удалена');
    loadNews();
  };

  const handleDeleteUser = async (id: string) => {
    await userService.deleteUser(id);
    message.success('Пользователь удален');
    loadUsers();
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setModalType('user');
    setModalVisible(true);
  };

  const handleEditNews = (item: News) => {
    setEditNews(item);
    setModalType('news');
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    try {
      await userService.updateUser(editUser.id, {
        email: editUser.email,
        username: editUser.username,
        role: editUser.role,
        isActive: editUser.isActive,
      });
      message.success('Пользователь сохранен');
      setModalVisible(false);
      loadUsers();
    } catch {
      message.error('Ошибка сохранения');
    }
  };

  const handleSaveNews = async () => {
    if (!editNews) return;
    try {
      await newsService.updateNews(editNews.id, {
        title: editNews.title,
        content: editNews.content,
        summary: editNews.summary,
        category: editNews.category,
        tags: editNews.tags,
        status: editNews.status,
        source: editNews.source,
        sourceUrl: editNews.sourceUrl,
        imageUrl: editNews.imageUrl,
        isAiGenerated: editNews.isAiGenerated,
      });
      message.success('Новость сохранена');
      setModalVisible(false);
      loadNews();
    } catch {
      message.error('Ошибка сохранения');
    }
  };

  const newsColumns: ColumnsType<News> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Категория', dataIndex: 'category', key: 'category', width: 120, render: (c) => <Tag>{c}</Tag> },
    { title: 'Статус', dataIndex: 'status', key: 'status', width: 120, render: (s) => <Tag>{s}</Tag> },
    { title: 'Дата', dataIndex: 'createdAt', key: 'date', width: 110, render: (d) => new Date(d).toLocaleDateString('ru-RU') },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditNews(r)} />
          <Popconfirm title="Удалить?" onConfirm={() => handleDeleteNews(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<User> = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (r) => <Tag color={r === 'super_admin' ? 'gold' : r === 'admin' ? 'red' : 'blue'}>{r === 'super_admin' ? '👑 Суперадмин' : r}</Tag>,
    },
    { title: 'Активен', dataIndex: 'isActive', key: 'active', width: 80, render: (a) => (a ? '✅' : '❌') },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditUser(r)} />
          {r.role !== 'super_admin' && (
            <Popconfirm title="Удалить?" onConfirm={() => handleDeleteUser(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const result = await aiService.autoGenerate(2); // по 2 новости на категорию
      message.success(`Сгенерировано ${result.totalGenerated} новостей`);
    } catch {
      message.error('Ошибка генерации');
    }
    setGenerating(false);
  };

  return (
    <div>
      <h2>
        <CrownOutlined style={{ color: 'gold', marginRight: 8 }} />
        Панель суперадмина
      </h2>
      <Space style={{ marginBottom: 16 }}>
        <Select value={table} onChange={setTable} style={{ width: 200 }}>
          <Select.Option value="news">
            <ReadOutlined /> Новости
          </Select.Option>
          <Select.Option value="users">
            <TeamOutlined /> Пользователи
          </Select.Option>
        </Select>
        <Button type="primary" icon={<RocketOutlined />} loading={generating} onClick={handleAutoGenerate}>
          Сгенерировать новости
        </Button>
      </Space>

      {table === 'news' ? (
        <Table columns={newsColumns} dataSource={news} rowKey="id" loading={loading} scroll={{ x: 700 }} />
      ) : (
        <Table columns={userColumns} dataSource={users} rowKey="id" loading={loading} scroll={{ x: 700 }} />
      )}

      <Modal
        title={modalType === 'user' ? 'Редактировать пользователя' : 'Редактировать новость'}
        open={modalVisible}
        onOk={modalType === 'user' ? handleSaveUser : handleSaveNews}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        {modalType === 'user' && editUser && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} placeholder="Email" />
            <Input value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} placeholder="Username" />
            <Select value={editUser.role} onChange={(v) => setEditUser({ ...editUser, role: v })} style={{ width: '100%' }}>
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
          </Space>
        )}

        {modalType === 'news' && editNews && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input value={editNews.title} onChange={(e) => setEditNews({ ...editNews, title: e.target.value })} placeholder="Заголовок" />
            <TextArea
              value={editNews.summary}
              onChange={(e) => setEditNews({ ...editNews, summary: e.target.value })}
              placeholder="Краткое описание"
              rows={3}
            />
            <TextArea
              value={editNews.content}
              onChange={(e) => setEditNews({ ...editNews, content: e.target.value })}
              placeholder="Контент"
              rows={6}
            />
            <Select value={editNews.category} onChange={(v) => setEditNews({ ...editNews, category: v })} style={{ width: '100%' }}>
              {Object.values(NewsCategory).map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
            <Select value={editNews.status} onChange={(v) => setEditNews({ ...editNews, status: v })} style={{ width: '100%' }}>
              {Object.values(NewsStatus).map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Input value={editNews.source} onChange={(e) => setEditNews({ ...editNews, source: e.target.value })} placeholder="Источник" />
            <Input value={editNews.sourceUrl} onChange={(e) => setEditNews({ ...editNews, sourceUrl: e.target.value })} placeholder="URL источника" />
            <Input value={editNews.imageUrl} onChange={(e) => setEditNews({ ...editNews, imageUrl: e.target.value })} placeholder="URL картинки" />
            <Switch
              checked={editNews.isAiGenerated}
              onChange={(c) => setEditNews({ ...editNews, isAiGenerated: c })}
              checkedChildren="AI"
              unCheckedChildren="Оригинал"
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default SuperAdminPanel;
