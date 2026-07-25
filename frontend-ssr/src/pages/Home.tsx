import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Statistic,
  Spin,
  Empty,
  Tag,
  Modal,
} from 'antd';
import {
  ReadOutlined,
  TeamOutlined,
  RocketOutlined,
  RobotOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import NewsDetailModal from '../components/NewsDetailModal';
import { useNewsStore } from '../store/newsStoreProvider';
import { isBrowser } from '../utils/isBrowser';
import { useNavigate } from 'react-router-dom';
import { NewsStats } from '../types';
import { newsService } from '../services/news.service';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const news = useNewsStore((s) => s.news);
  const loading = useNewsStore((s) => s.loading);
  const fetchNews = useNewsStore((s) => s.fetchNews);
  const navigate = useNavigate();

  const [stats, setStats] = useState<NewsStats | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (news.length === 0) {
      fetchNews({ limit: 6 });
    }
    newsService.getStats().then(setStats);
  }, [news.length, fetchNews]);

  const getToken = () => {
    if (isBrowser()) return localStorage.getItem('accessToken');
    return null;
  };

  const token = getToken();
  const isAuthenticated = !!token;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);

    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин. назад`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;

    return d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      politics: 'blue',
      economy: 'green',
      technology: 'purple',
      science: 'cyan',
      sports: 'orange',
      entertainment: 'magenta',
      health: 'red',
      world: 'geekblue',
    };
    return colors[cat] || 'default';
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      politics: 'Политика',
      economy: 'Экономика',
      technology: 'Технологии',
      science: 'Наука',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      health: 'Здоровье',
      world: 'Мир',
    };
    return labels[cat] || cat;
  };

  const setLocation = (url: string) => {
    navigate(url);
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div
        style={{
          textAlign: 'center',
          marginBottom: 48,
          padding: 'clamp(24px, 5vw, 48px) clamp(12px, 3vw, 24px)',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          wordBreak: 'break-word',
        }}
      >
        <Title
          level={1}
          style={{
            color: 'white',
            fontSize: 'clamp(1.5em, 8vw, 3em)',
            marginBottom: 16,
            wordBreak: 'break-word',
          }}
        >
          📰 News Portal
        </Title>
        <Paragraph
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(0.9em, 3vw, 1.2em)',
            marginBottom: 32,
            maxWidth: 600,
            margin: '0 auto 32px',
            padding: '0 8px',
          }}
        >
          Актуальные новости с AI-рерайтом из проверенных источников.
        </Paragraph>

        <Space size="large" wrap>
          {!isAuthenticated ? (
            <>
              <Button
                type="primary"
                size="large"
                onClick={() => setLocation('/register')}
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
                icon={<RocketOutlined />}
              >
                Начать бесплатно
              </Button>
              <Button
                size="large"
                ghost
                onClick={() => setLocation('/login')}
                style={{
                  color: 'white',
                  borderColor: 'white',
                  whiteSpace: 'nowrap',
                }}
              >
                Войти
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => setLocation('/news')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                fontWeight: 'bold',
              }}
              icon={<ReadOutlined />}
            >
              Читать новости
            </Button>
          )}
        </Space>
      </div>

      {/* Статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="Сегодня"
              value={stats?.newsToday || 0}
              prefix={<ReadOutlined />}
              loading={!stats}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="Пользователей"
              value={stats?.totalUsers || 0}
              prefix={<TeamOutlined />}
              loading={!stats}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="AI-рерайт"
              value={stats?.totalAiNews || 0}
              prefix={<RobotOutlined />}
              loading={!stats}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="Всего новостей"
              value={stats?.totalNews || 0}
              prefix={<ReadOutlined />}
              loading={!stats}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="Просмотров"
              value={stats?.totalViews || 0}
              prefix={<EyeOutlined />}
              loading={!stats}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable>
            <Statistic
              title="На модерации"
              value={stats?.pendingNews || 0}
              prefix={<ClockCircleOutlined />}
              styles={
                stats?.pendingNews
                  ? { content: { color: '#faad14' } }
                  : undefined
              }
              loading={!stats}
            />
          </Card>
        </Col>
      </Row>

      <Title level={2}>Последние новости</Title>

      <Spin spinning={loading}>
        {news.length > 0 ? (
          <Row gutter={[16, 16]}>
            {news.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  onClick={() => {
                    setSelectedNewsId(item.id);
                    setModalVisible(true);
                  }}
                  cover={
                    item.imageUrl ? (
                      <img
                        alt={item.title}
                        src={item.imageUrl}
                        style={{
                          height: 200,
                          objectFit: 'cover',
                          maxWidth: '100%',
                        }}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={
                      <span style={{ wordBreak: 'break-word' }}>
                        {item.title}
                      </span>
                    }
                    description={
                      <>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {item.summary?.substring(0, 120)}...
                        </Paragraph>
                        <Space wrap size={[4, 4]} style={{ marginTop: 8 }}>
                          <Tag color={getCategoryColor(item.category)}>
                            {getCategoryLabel(item.category)}
                          </Tag>
                          {item.isAiGenerated ? (
                            <Tag icon={<RobotOutlined />} color="blue">
                              AI-рерайт
                            </Tag>
                          ) : (
                            <Tag icon={<LinkOutlined />} color="green">
                              Оригинал
                            </Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined />{' '}
                            {formatDate(item.publishedAt)}
                          </Text>
                        </Space>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Новости пока не загружены" />
        )}
      </Spin>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        destroyOnHidden
      >
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default Home;
