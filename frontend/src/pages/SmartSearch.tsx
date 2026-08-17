import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Empty, Input, Modal, Row, Skeleton, Spin, Tag, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import { formatAppliedFilters } from '@/utils/formatAppliedFilters.ts';
import { useNewsModal } from '@/hooks/useNewsModal.ts';

const NewsDetailModal = lazy(() => import('@/components/NewsDetailModal'));
const NewsListCard = lazy(() => import('@/components/news/NewsListCard'));

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PAGE_SIZE = 20;

const EXAMPLE_QUERIES = ['AI новости про технологии за неделю', 'экономика и инфляция', 'популярные новости про спорт'];

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchHint, setSearchHint] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'ai' | 'fallback' | null>(null);
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();
  const loaderRef = useRef<HTMLDivElement>(null);

  const applyResponse = useCallback((data: Awaited<ReturnType<typeof newsService.smartSearch>>, pageNum: number, append: boolean) => {
    setNews((prev) => (append ? [...prev, ...data.data] : data.data));
    setHasMore(pageNum * PAGE_SIZE < data.total);
    setSearchHint(formatAppliedFilters(data.appliedFilters));
    setSearchSource(data.source);
  }, []);

  const runSearch = useCallback(
    async (searchQuery: string, pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await newsService.smartSearch(searchQuery, pageNum, PAGE_SIZE);
        applyResponse(data, pageNum, append);
      } catch {
        if (!append) {
          setNews([]);
          setHasMore(false);
          setSearchHint(null);
          setSearchSource(null);
        }
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [applyResponse],
  );

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setActiveQuery(trimmed);
    setPage(1);
    setHasMore(true);
    runSearch(trimmed, 1, false);
  };

  useEffect(() => {
    if (!activeQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          runSearch(activeQuery, nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [activeQuery, hasMore, loading, loadingMore, page, runSearch]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Helmet>
        <title>Short News — 🧠 Умный поиск</title>
        <meta name="description" content="Опишите запрос своими словами — AI подберёт фильтры для поиска новостей." />
      </Helmet>

      <Title level={2} style={{ marginBottom: 8 }}>
        🧠 Умный поиск
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Опишите запрос своими словами — AI подберёт фильтры, а поиск выполнится по заголовку, описанию и тегам.
      </Paragraph>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <TextArea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Например: AI новости про технологии за последнюю неделю"
          autoSize={{ minRows: 2, maxRows: 4 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
          style={{ flex: 1, minWidth: 280 }}
        />
        <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleSearch} disabled={!query.trim() || loading}>
          Найти
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {EXAMPLE_QUERIES.map((example) => (
          <Tag key={example} style={{ cursor: 'pointer' }} onClick={() => setQuery(example)}>
            {example}
          </Tag>
        ))}
      </div>

      {searchHint && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Распознано{searchSource === 'fallback' ? ' (без AI)' : ''}: {searchHint}
        </Text>
      )}

      {!activeQuery && !loading && <Text type="secondary">Введите запрос и нажмите «Найти».</Text>}

      {loading ? (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: '100%' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </Row>
      ) : news.length > 0 ? (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {news.map((item) => (
              <NewsListCard key={item.id} item={item} openNews={openNews} />
            ))}
          </Row>
          <div ref={loaderRef} style={{ textAlign: 'center', padding: '24px 0' }}>
            {loadingMore && <Spin />}
            {!hasMore && <Text type="secondary">Все результаты загружены</Text>}
          </div>
        </>
      ) : activeQuery ? (
        <Empty description={`По запросу «${activeQuery}» ничего не найдено`} style={{ marginTop: 24 }} />
      ) : null}

      <Modal open={modalVisible} onCancel={closeNews} footer={null} width={900} centered destroyOnHidden style={{ top: 20 }}>
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
      </Modal>
    </div>
  );
};

export default SmartSearch;
