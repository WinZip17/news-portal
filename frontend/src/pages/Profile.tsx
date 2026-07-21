import React, { useEffect, useState } from 'react';
import { Tabs, Card, Form, Input, Button, Switch, Select, message, Tag, Space, Empty, Spin, Modal } from 'antd';
import { UserOutlined, HeartOutlined, SettingOutlined, RobotOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import { useNewsModal } from '@/hooks/useNewsModal.ts';
import NewsDetailModal from '@/components/NewsDetailModal';
import { Typography } from 'antd';

const { Text } = Typography;

const Profile: React.FC = () => {
  const { user, updateProfile, updatePreferences } = useAuth();
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();
  const [favorites, setFavorites] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await newsService.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      message.error('Ошибка загрузки избранного');
    }
    setLoading(false);
  };

  const handleSaveProfile = async (values: any) => {
    await updateProfile(values);
    message.success('Профиль обновлен');
  };

  const handleSavePreferences = async (values: any) => {
    await updatePreferences(values);
    message.success('Настройки сохранены');
  };

  const handleRemoveFavorite = async (newsId: string) => {
    await newsService.toggleFavorite(newsId);
    loadFavorites();
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> Профиль</span>,
      children: (
        <Card>
          <Form layout="vertical" initialValues={user || undefined} onFinish={handleSaveProfile}>
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
              <Button type="primary" htmlType="submit">Сохранить</Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'preferences',
      label: <span><SettingOutlined /> Настройки</span>,
      children: (
        <Card>
          <Form layout="vertical" initialValues={user?.preferences || undefined} onFinish={handleSavePreferences}>
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
            <Form.Item label="Уведомления" name="notificationsEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Email рассылка" name="emailNotifications" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Сохранить</Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'favorites',
      label: <span><HeartOutlined /> Избранное</span>,
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
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ flex: 1 }}>
                  <a
                    onClick={() => openNews(item.id)}
                    style={{ fontSize: '16px', fontWeight: 500, marginBottom: 8, display: 'block' }}
                  >
                    {item.title}
                  </a>
                  <Space wrap size={[4, 4]}>
                    <Tag>{item.category}</Tag>
                    {item.isAiGenerated ? (
                      <Tag icon={<RobotOutlined />} color="blue">AI</Tag>
                    ) : (
                      <Tag icon={<LinkOutlined />} color="green">Оригинал</Tag>
                    )}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                    </Text>
                  </Space>
                </div>
                <Button type="link" danger onClick={() => handleRemoveFavorite(item.id)}>
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
      <Tabs items={tabItems} />

      <Modal
        open={modalVisible}
        onCancel={closeNews}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        style={{ top: 20 }}
      >
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default Profile;