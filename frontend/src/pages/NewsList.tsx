import React, { lazy, useEffect } from 'react';
import { Pagination, Empty, Spin, Typography, Divider, Button, Modal, Row, Col, Card, Skeleton } from 'antd';
import { useNews } from '@/hooks/useNews';
import { useNewsModal } from '@/hooks/useNewsModal.ts';
import { Helmet } from 'react-helmet-async';

const { Title, Text } = Typography;

const NewsDetailModal = lazy(() => import('@/components/NewsDetailModal'));
const NewsListCard = lazy(() => import('@/components/news/NewsListCard'));
const NewsListFilters = lazy(() => import('@/components/news/NewsListFilters'));

const NewsList: React.FC = () => {
  const { news, isLoading, pagination, fetchNews, error, filters, initialLoading, clearAllFilters, setPage } = useNews();
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();

  useEffect(() => {
    fetchNews();
  }, [JSON.stringify(filters)]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Helmet>
        <title>News Portal — 📰 Лента новостей. Короткие новости без манипуляций</title>
        <meta name="description" content="Быстрые и короткие новости с AI-рерайтом. Минимум слов, максимум фактов." />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      <Title level={2} style={{ marginBottom: 16 }}>
        📰 Лента новостей
      </Title>

      <NewsListFilters hasActiveFilters={hasActiveFilters} />
      {hasActiveFilters && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          Показаны результаты с фильтрами
        </Text>
      )}

      <Divider style={{ margin: '12px 0' }} />

      <Spin spinning={isLoading}>
        {error ? (
          <Empty description={<Text type="danger">Ошибка: {error}</Text>}>
            <Button onClick={() => fetchNews()}>Повторить</Button>
          </Empty>
        ) : initialLoading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Col style={{ width: '100%' }} key={i}>
                <Card style={{ borderRadius: 8, marginBottom: 12 }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : news.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {news.map((item) => (
                <NewsListCard key={item.id} item={item} openNews={openNews} />
              ))}
            </Row>
            {pagination.totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={setPage}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
          </>
        ) : (
          <Empty description={hasActiveFilters ? 'Ничего не найдено' : 'Новостей пока нет'} style={{ padding: '40px 0' }}>
            {hasActiveFilters ? <Button onClick={clearAllFilters}>Сбросить</Button> : <Button onClick={() => fetchNews()}>Обновить</Button>}
          </Empty>
        )}
      </Spin>

      <Modal open={modalVisible} onCancel={closeNews} footer={null} width={900} centered destroyOnHidden style={{ top: 20 }}>
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default NewsList;
