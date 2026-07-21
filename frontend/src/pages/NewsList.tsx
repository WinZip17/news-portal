import React, { useEffect, useCallback } from 'react';
import {
  Input, Select, Tag, Space, Pagination, Empty, Spin, Typography,
  Divider, Button, Modal, Row, Col, Card,
} from 'antd';
import {
  SearchOutlined, ClockCircleOutlined, EyeOutlined, HeartOutlined,
  LinkOutlined, RobotOutlined, ClearOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useNews } from '@/hooks/useNews';
import NewsDetailModal from '@/components/NewsDetailModal';
import { useNewsModal } from '@/hooks/useNewsModal.ts';
import { NewsCategory, NewsFilter } from '@/types'

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const NewsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();
  const { news, isLoading, pagination, fetchNews, setFilters, error, clearError } = useNews();

  useEffect(() => {
    const urlFilters: NewsFilter = {};

    const category = searchParams.get('category');
    urlFilters.category = (category && category !== 'all') ? category as NewsCategory : undefined;

    const search = searchParams.get('search');
    urlFilters.search = search || undefined;

    const page = searchParams.get('page');
    urlFilters.page = page ? parseInt(page, 10) : undefined;

    const sortBy = searchParams.get('sortBy');
    urlFilters.sortBy = sortBy as "createdAt" | "views" | "likes" | "publishedAt" || undefined;

    const isAiGenerated = searchParams.get('isAiGenerated');
    urlFilters.isAiGenerated = (isAiGenerated && isAiGenerated !== 'all') ? isAiGenerated === 'true' : undefined;

    setFilters(urlFilters);
    fetchNews(urlFilters);
  }, [searchParams]);

  const handleSearch = useCallback((value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set('search', value) : p.delete('search');
    p.delete('page');
    setSearchParams(p);
  }, [searchParams]);

  const handleCategoryChange = useCallback((category: string) => {
    const p = new URLSearchParams(searchParams);
    category !== 'all' ? p.set('category', category) : p.delete('category');
    p.delete('page');
    setSearchParams(p);
  }, [searchParams]);

  const handleSortChange = useCallback((sortBy: string) => {
    const p = new URLSearchParams(searchParams);
    sortBy !== 'publishedAt' ? p.set('sortBy', sortBy) : p.delete('sortBy');
    p.delete('page');
    setSearchParams(p);
  }, [searchParams]);

  const handleAiFilterChange = useCallback((value: string) => {
    const p = new URLSearchParams(searchParams);
    value !== 'all' ? p.set('isAiGenerated', value) : p.delete('isAiGenerated');
    p.delete('page');
    setSearchParams(p);
  }, [searchParams]);

  const handlePageChange = useCallback((page: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', page.toString());
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const handleClearFilters = useCallback(() => setSearchParams({}), []);

  const getCategoryColor = (cat: string) => {
    const c: Record<string, string> = {
      politics: 'blue',
      economy: 'green',
      technology: 'purple',
      science: 'cyan',
      sports: 'orange',
      entertainment: 'magenta',
      health: 'red',
      world: 'geekblue',
      other: 'default'
    };
    return c[cat] || 'default';
  };

  const getCategoryLabel = (cat: string) => {
    const l: Record<string, string> = {
      politics: 'Политика',
      economy: 'Экономика',
      technology: 'Технологии',
      science: 'Наука',
      sports: 'Спорт',
      entertainment: 'Развлечения',
      health: 'Здоровье',
      world: 'Мир',
      other: 'Другое'
    };
    return l[cat] || cat;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин. назад`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
    if (diff < 10080) return `${Math.floor(diff / 1440)} дн. назад`;
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 16 }}>📰 Лента новостей</Title>

      <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
        <Input.Search
          placeholder="Поиск..."
          allowClear
          defaultValue={searchParams.get('search') || ''}
          style={{ minWidth: 200 }}
          prefix={<SearchOutlined/>}
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch(''); // Очистка при пустом поле
            }
          }}
        />
        <Select value={searchParams.get('category') || 'all'} style={{ minWidth: 160 }} onChange={handleCategoryChange}>
          <Option value="all">📂 Все</Option>
          <Option value={NewsCategory.POLITICS}>🏛 Политика</Option>
          <Option value={NewsCategory.ECONOMY}>💹 Экономика</Option>
          <Option value={NewsCategory.TECHNOLOGY}>💻 Технологии</Option>
          <Option value={NewsCategory.SCIENCE}>🔬 Наука</Option>
          <Option value={NewsCategory.SPORTS}>⚽ Спорт</Option>
          <Option value={NewsCategory.ENTERTAINMENT}>🎬 Развлечения</Option>
          <Option value={NewsCategory.HEALTH}>🏥 Здоровье</Option>
          <Option value={NewsCategory.WORLD}>🌍 Мир</Option>
        </Select>
        <Select value={searchParams.get('sortBy') || 'publishedAt'} style={{ minWidth: 140 }}
                onChange={handleSortChange}>
          <Option value="publishedAt">🕒 По дате</Option>
          <Option value="views">👁 По просмотрам</Option>
          <Option value="likes">❤️ По лайкам</Option>
        </Select>
        <Select value={searchParams.get('isAiGenerated') || 'all'} style={{ minWidth: 150 }}
                onChange={handleAiFilterChange}>
          <Option value="all">📋 Все</Option>
          <Option value="true">🤖 AI-рерайт</Option>
          <Option value="false">📄 Оригиналы</Option>
        </Select>
        {hasActiveFilters &&
            <Button icon={<ClearOutlined/>} onClick={handleClearFilters} size="small">Сбросить</Button>}
      </Space>
      {hasActiveFilters &&
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Показаны результаты с фильтрами</Text>}

      <Divider style={{ margin: '12px 0' }}/>

      <Spin spinning={isLoading}>
        {error ? (
          <Empty description={<Text type="danger">Ошибка: {error}</Text>}>
            <Button onClick={() => fetchNews(pagination)}>Повторить</Button>
          </Empty>
        ) : news.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {news.map((item) => (
                <Col style={{ width: '100%' }} key={item.id}>
                  <Card
                    hoverable
                    onClick={() => openNews(item.id)}
                    style={{ height: '100%', borderRadius: 8 }}
                    styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%' } }}
                  >
                    <Text strong style={{ fontSize: '15px', wordBreak: 'break-word', flexShrink: 0 }}>
                      {item.title}
                    </Text>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        flex: 1,
                        margin: '8px 0',
                        color: '#666',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}
                    >
                      {item.summary || item.content?.substring(0, 150) || 'Описание отсутствует'}
                    </Paragraph>
                    <Space wrap size={[4, 4]} style={{ marginTop: 'auto' }}>
                      <Tag color={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Tag>
                      {item.isAiGenerated ? <Tag icon={<RobotOutlined/>} color="blue">AI</Tag> :
                        <Tag icon={<LinkOutlined/>} color="green">Оригинал</Tag>}
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        <ClockCircleOutlined/> {formatDate(item.publishedAt)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}><EyeOutlined/> {item.views || 0}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}><HeartOutlined/> {item.likes || 0}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
            {pagination.totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination current={pagination.page} total={pagination.total} pageSize={pagination.limit}
                            onChange={handlePageChange} showSizeChanger={false} showQuickJumper/>
              </div>
            )}
          </>
        ) : (
          <Empty description={hasActiveFilters ? 'Ничего не найдено' : 'Новостей пока нет'}
                 style={{ padding: '40px 0' }}>
            {hasActiveFilters ? <Button onClick={handleClearFilters}>Сбросить</Button> :
              <Button onClick={() => fetchNews()}>Обновить</Button>}
          </Empty>
        )}
      </Spin>

      <Modal open={modalVisible} onCancel={closeNews} footer={null} width={900} centered destroyOnHidden
             style={{ top: 20 }}>
        {selectedNewsId && <NewsDetailModal newsId={selectedNewsId}/>}
      </Modal>
    </div>
  );
};

export default NewsList;