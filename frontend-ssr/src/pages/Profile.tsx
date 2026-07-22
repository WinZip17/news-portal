import React, { useEffect, useState } from 'react';
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  message,
  Tag,
  Space,
  Empty,
  Spin,
  Typography,
} from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
  RobotOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

interface News {
  id: string;
  title: string;
  category: string;
  isAiGenerated: boolean;
  publishedAt: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    if (!window) return null;
    return localStorage.getItem('accessToken');
  };
  const token = getToken();

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    axios
      .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setUser(r.data));
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/news/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.data);
    } catch {}
    setLoading(false);
  };

  const handleSaveProfile = async (values: any) => {
    await axios.put('/api/auth/profile', values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    message.success('Профиль обновлен');
  };

  const handleSavePreferences = async (values: any) => {
    await axios.put('/api/auth/preferences', values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    message.success('Настройки сохранены');
  };

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await axios.post('/api/auth/change-password', values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    message.success('Пароль изменен');
  };

  const handleRemoveFavorite = async (newsId: string) => {
    await axios.post(
      `/api/news/${newsId}/favorite`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    loadFavorites();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU');

  if (!user)
    return (
      <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
    );

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Профиль
        </span>
      ),
      children: (
        <Card>
          <Form
            layout="vertical"
            initialValues={user}
            onFinish={handleSaveProfile}
          >
            <Form.Item label="Имя" name="firstName">
              <Input />
            </Form.Item>
            <Form.Item label="Фамилия" name="lastName">
              <Input />
            </Form.Item>
            <Form.Item label="Username" name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <KeyOutlined /> Пароль
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              name="currentPassword"
              label="Текущий пароль"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Новый пароль"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Подтвердите пароль"
              dependencies={['newPassword']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value)
                      return Promise.resolve();
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Сменить пароль
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'preferences',
      label: (
        <span>
          <SettingOutlined /> Настройки
        </span>
      ),
      children: (
        <Card>
          <Form
            layout="vertical"
            initialValues={user?.preferences}
            onFinish={handleSavePreferences}
          >
            <Form.Item label="Тема" name="theme">
              <Select>
                <Select.Option value="light">Светлая</Select.Option>
                <Select.Option value="dark">Темная</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Язык" name="language">
              <Select>
                <Select.Option value="ru">Русский</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Уведомления"
              name="notificationsEnabled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Email рассылка"
              name="emailNotifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'favorites',
      label: (
        <span>
          <HeartOutlined /> Избранное
        </span>
      ),
      children: (
        <Spin spinning={loading}>
          {favorites.length === 0 ? (
            <Empty description="Нет избранных новостей" />
          ) : (
            favorites.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <a
                    href={`/?news=${item.id}`}
                    style={{ fontSize: 16, fontWeight: 500 }}
                  >
                    {item.title}
                  </a>
                  <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                    <Tag>{item.category}</Tag>
                    {item.isAiGenerated ? (
                      <Tag icon={<RobotOutlined />} color="blue">
                        AI
                      </Tag>
                    ) : (
                      <Tag icon={<LinkOutlined />} color="green">
                        Оригинал
                      </Tag>
                    )}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                    </Text>
                  </Space>
                </div>
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveFavorite(item.id)}
                >
                  Удалить
                </Button>
              </div>
            ))
          )}
        </Spin>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>Личный кабинет</h1>
      <Tabs items={items} />
    </div>
  );
};

export default Profile;
