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
  ArrowRightOutlined,
  RobotOutlined,
  LinkOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import NewsDetailModal from '../components/NewsDetailModal';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;

interface News {
  id: string;
  title: string;
  summary?: string;
  category: string;
  tags?: string[];
  isAiGenerated: boolean;
  views: number;
  likes: number;
  source?: string;
  publishedAt: string;
  imageUrl?: string;
}

const Home: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isAuthenticated = !!localStorage.getItem('accessToken');

  useEffect(() => {
    axios
      .get('/api/news', {
        params: { limit: 6, sortBy: 'publishedAt', sortOrder: 'DESC' },
      })
      .then((res) => setNews(res.data.data))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          marginBottom: 48,
          padding: '48px 24px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Title
          level={1}
          style={{ color: 'white', fontSize: '3em', marginBottom: 16 }}
        >
          📰 News Portal
        </Title>
        <Paragraph
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.2em',
            marginBottom: 32,
            maxWidth: 600,
            margin: '0 auto 32px',
          }}
        >
          Актуальные новости с AI-рерайтом из проверенных источников.
        </Paragraph>
        <Space size="large">
          {!isAuthenticated ? (
            <>
              <Button
                type="primary"
                size="large"
                onClick={() => (window.location.href = '/register')}
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  fontWeight: 'bold',
                }}
                icon={<RocketOutlined />}
              >
                Начать бесплатно
              </Button>
              <Button
                size="large"
                ghost
                onClick={() => (window.location.href = '/login')}
                style={{ color: 'white', borderColor: 'white' }}
              >
                Войти
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => (window.location.href = '/news')}
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

      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Новостей сегодня"
              value={news?.length | 0}
              prefix={<ReadOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Пользователей"
              value={1523}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="AI-рерайт"
              value={856}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Title level={2}>Последние новости</Title>
      <Spin spinning={loading}>
        {news?.length > 0 ? (
          <Row gutter={[24, 24]}>
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
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={item.title}
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }}>
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
        width={900}
        centered
        destroyOnHidden
      >
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default Home;
