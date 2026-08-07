import React, { lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { Row, Typography, Button, Space, Empty, Modal } from 'antd';
import { ReadOutlined, RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNewsQuery } from '@/hooks/useNewsQuery';
import { useNewsModal } from '@/hooks/useNewsModal.ts';

const { Title, Paragraph } = Typography;

const NewsSkeleton = lazy(() => import('@/components/news/NewsSkerleton.tsx'));
const NewsStats = lazy(() => import('@/components/news/NewsStats.tsx'));
const NewsCard = lazy(() => import('@/components/news/NewsCard.tsx'));
const NewsDetailModal = lazy(() => import('@/components/NewsDetailModal'));

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();

  const { data, isLoading, refetch } = useNewsQuery({
    limit: 6,
    sortBy: 'publishedAt',
    sortOrder: 'DESC',
  });

  const news = data?.data ?? [];

  return (
    <div>
      <Helmet>
        <title>Short News — Короткие новости без манипуляций</title>
        <meta name="description" content="Быстрые и короткие новости с AI-рерайтом. Минимум слов, максимум фактов." />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

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
        <Title level={1} style={{ color: 'white', fontSize: '3em', marginBottom: 16 }}>
          📰 Short News
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2em', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Актуальные новости с AI-рерайтом из проверенных источников.
        </Paragraph>
        <Space size="large">
          {!isAuthenticated ? (
            <>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/register')}
                style={{ background: 'white', color: '#667eea', border: 'none', fontWeight: 'bold' }}
                icon={<RocketOutlined />}
              >
                Начать бесплатно
              </Button>
              <Button size="large" ghost onClick={() => navigate('/login')} style={{ color: 'white', borderColor: 'white' }}>
                Войти
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/news')}
              style={{ background: 'white', color: '#667eea', border: 'none', fontWeight: 'bold' }}
              icon={<ReadOutlined />}
            >
              Читать новости
            </Button>
          )}
        </Space>
      </div>

      <NewsStats />

      <div style={{ marginBottom: 24 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            Последние новости
          </Title>
          <Button type="link" onClick={() => navigate('/news')} icon={<ArrowRightOutlined />}>
            Все новости
          </Button>
        </Space>

        {isLoading ? (
          <NewsSkeleton />
        ) : news.length > 0 ? (
          <Row gutter={[24, 24]}>
            {news.map((item) => (
              <NewsCard key={item.id} item={item} openNews={openNews} />
            ))}
          </Row>
        ) : (
          <Empty description="Новости пока не загружены" style={{ padding: '40px 0' }}>
            <Button type="primary" onClick={() => refetch()}>
              Загрузить новости
            </Button>
          </Empty>
        )}
      </div>

      <Modal open={modalVisible} onCancel={closeNews} footer={null} width={900} centered destroyOnHidden style={{ top: 20 }}>
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default Home;
