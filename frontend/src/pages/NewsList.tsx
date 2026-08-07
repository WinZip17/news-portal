import React, { lazy, useEffect, useRef } from 'react';
import { Empty, Spin, Typography, Divider, Button, Modal, Row, Col, Card, Skeleton } from 'antd';
import { useNewsInfiniteQuery } from '@/hooks/useNewsQuery';
import { useNewsModal } from '@/hooks/useNewsModal.ts';
import { useNews } from '@/hooks/useNews';
import { Helmet } from 'react-helmet-async';

const { Title, Text } = Typography;

const NewsDetailModal = lazy(() => import('@/components/NewsDetailModal'));
const NewsListCard = lazy(() => import('@/components/news/NewsListCard'));
const NewsListFilters = lazy(() => import('@/components/news/NewsListFilters'));

const NewsList: React.FC = () => {
  const { filters, clearAllFilters } = useNews();
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useNewsInfiniteQuery(filters);

  const news = data?.pages.flatMap((page) => page.data) ?? [];

  // Бесконечный скролл
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Helmet>
        <title>Short News — 📰 Лента новостей. Короткие новости без манипуляций</title>
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

      {error ? (
        <Empty description={<Text type="danger">Ошибка: {(error as Error).message}</Text>}>
          <Button onClick={() => fetchNextPage()}>Повторить</Button>
        </Empty>
      ) : isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 20 }).map((_, i) => (
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
          <div ref={loaderRef} style={{ textAlign: 'center', padding: '24px 0' }}>
            {isFetchingNextPage && <Spin />}
            {!hasNextPage && news.length > 0 && <Text type="secondary">Все новости загружены</Text>}
          </div>
        </>
      ) : (
        <Empty description={hasActiveFilters ? 'Ничего не найдено' : 'Новостей пока нет'} style={{ padding: '40px 0' }}>
          {hasActiveFilters ? <Button onClick={clearAllFilters}>Сбросить</Button> : <Button onClick={() => fetchNextPage()}>Обновить</Button>}
        </Empty>
      )}

      <Modal open={modalVisible} onCancel={closeNews} footer={null} width={900} centered destroyOnHidden style={{ top: 20 }}>
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default NewsList;
