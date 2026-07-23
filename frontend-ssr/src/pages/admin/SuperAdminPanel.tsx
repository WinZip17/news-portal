import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Select,
  message,
  Popconfirm,
  Modal,
  Input,
  Switch,
} from 'antd';
import {
  ReadOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  CrownOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import type { ColumnsType } from 'antd/es/table';

interface News {
  id: string;
  title: string;
  category: string;
  status: string;
  isAiGenerated: boolean;
  views: number;
  createdAt: string;
  summary?: string;
  content?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  tags?: string[];
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
}

const { TextArea } = Input;

const SuperAdminPanel: React.FC = () => {
  const [table, setTable] = useState<'news' | 'users'>('news');
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editItem, setEditItem] = useState<News | User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'news'>('user');

  useEffect(() => {
    table === 'news' ? loadNews() : loadUsers();
  }, [table]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const r = await api.get('/news', { params: { limit: 100 } });
      setNews(r.data.data);
    } catch {
      message.error('Ошибка');
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get('/auth/users', { params: { limit: 100 } });
      setUsers(r.data.data);
    } catch {
      message.error('Ошибка');
    }
    setLoading(false);
  };

  const handleDeleteNews = async (id: string) => {
    await api.delete(`/news/${id}`);
    message.success('Удалено');
    loadNews();
  };
  const handleDeleteUser = async (id: string) => {
    await api.delete(`/auth/users/${id}`);
    message.success('Удален');
    loadUsers();
  };

  const handleEdit = (item: News | User, type: 'news' | 'user') => {
    setEditItem(item);
    setModalType(type);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editItem) return;
    try {
      if (modalType === 'user') {
        const u = editItem as User;
        await api.put(`/auth/users/${u.id}`, {
          email: u.email,
          username: u.username,
          role: u.role,
          isActive: u.isActive,
        });
      } else {
        const n = editItem as News;
        await api.put(`/news/${n.id}`, n);
      }
      message.success('Сохранено');
      setModalVisible(false);
      modalType === 'user' ? loadUsers() : loadNews();
    } catch {
      message.error('Ошибка');
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const r = await api.post('/ai/auto-generate', { countPerCategory: 2 });
      message.success(`Сгенерировано ${r.data.totalGenerated} новостей`);
      loadNews();
    } catch {
      message.error('Ошибка');
    }
    setGenerating(false);
  };

  const newsColumns: ColumnsType<News> = [
    { title: 'Заголовок', dataIndex: 'title', ellipsis: true },
    {
      title: 'Категория',
      dataIndex: 'category',
      width: 120,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (s: string) => <Tag>{s}</Tag>,
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      width: 110,
      render: (d: string) => new Date(d).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(r, 'news')}
          />
          <Popconfirm title="Удалить?" onConfirm={() => handleDeleteNews(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<User> = [
    { title: 'Username', dataIndex: 'username' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Роль',
      dataIndex: 'role',
      width: 130,
      render: (r: string) => (
        <Tag
          color={r === 'super_admin' ? 'gold' : r === 'admin' ? 'red' : 'blue'}
        >
          {r === 'super_admin' ? '👑 Суперадмин' : r}
        </Tag>
      ),
    },
    {
      title: 'Активен',
      dataIndex: 'isActive',
      width: 80,
      render: (a: boolean) => (a ? '✅' : '❌'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(r, 'user')}
          />
          {r.role !== 'super_admin' && (
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDeleteUser(r.id)}
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
        <Button
          type="primary"
          icon={<RocketOutlined />}
          loading={generating}
          onClick={handleAutoGenerate}
        >
          Сгенерировать новости
        </Button>
      </Space>

      {table === 'news' ? (
        <Table
          columns={newsColumns}
          dataSource={news}
          rowKey="id"
          loading={loading}
          scroll={{ x: 700 }}
        />
      ) : (
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 700 }}
        />
      )}

      <Modal
        title={modalType === 'user' ? 'Пользователь' : 'Новость'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        {editItem && modalType === 'user' && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              value={(editItem as User).email}
              onChange={(e) =>
                setEditItem({ ...editItem, email: e.target.value })
              }
              placeholder="Email"
            />
            <Input
              value={(editItem as User).username}
              onChange={(e) =>
                setEditItem({ ...editItem, username: e.target.value })
              }
              placeholder="Username"
            />
            <Select
              value={(editItem as User).role}
              onChange={(v) => setEditItem({ ...editItem, role: v })}
              style={{ width: '100%' }}
            >
              <Select.Option value="user">Пользователь</Select.Option>
              <Select.Option value="moderator">Модератор</Select.Option>
              <Select.Option value="admin">Админ</Select.Option>
            </Select>
            <Switch
              checked={(editItem as User).isActive}
              onChange={(c) => setEditItem({ ...editItem, isActive: c })}
              checkedChildren="Активен"
              unCheckedChildren="Заблокирован"
            />
          </Space>
        )}
        {editItem && modalType === 'news' && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              value={(editItem as News).title}
              onChange={(e) =>
                setEditItem({ ...editItem, title: e.target.value })
              }
              placeholder="Заголовок"
            />
            <TextArea
              value={(editItem as News).summary}
              onChange={(e) =>
                setEditItem({ ...editItem, summary: e.target.value })
              }
              placeholder="Краткое описание"
              rows={3}
            />
            <TextArea
              value={(editItem as News).content}
              onChange={(e) =>
                setEditItem({ ...editItem, content: e.target.value })
              }
              placeholder="Контент"
              rows={6}
            />
            <Select
              value={(editItem as News).category}
              onChange={(v) => setEditItem({ ...editItem, category: v })}
              style={{ width: '100%' }}
            >
              {[
                'politics',
                'economy',
                'technology',
                'science',
                'sports',
                'entertainment',
                'health',
                'world',
              ].map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={(editItem as News).status}
              onChange={(v) => setEditItem({ ...editItem, status: v })}
              style={{ width: '100%' }}
            >
              {['draft', 'pending', 'published', 'rejected', 'archived'].map(
                (s) => (
                  <Select.Option key={s} value={s}>
                    {s}
                  </Select.Option>
                ),
              )}
            </Select>
            <Input
              value={(editItem as News).source}
              onChange={(e) =>
                setEditItem({ ...editItem, source: e.target.value })
              }
              placeholder="Источник"
            />
            <Input
              value={(editItem as News).sourceUrl}
              onChange={(e) =>
                setEditItem({ ...editItem, sourceUrl: e.target.value })
              }
              placeholder="URL источника"
            />
            <Input
              value={(editItem as News).imageUrl}
              onChange={(e) =>
                setEditItem({ ...editItem, imageUrl: e.target.value })
              }
              placeholder="URL картинки"
            />
            <Switch
              checked={(editItem as News).isAiGenerated}
              onChange={(c) => setEditItem({ ...editItem, isAiGenerated: c })}
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
