import React, { useEffect, useState } from 'react';
import {
  Input,
  Select,
  Tag,
  Space,
  Pagination,
  Empty,
  Spin,
  Typography,
  Row,
  Col,
  Card,
  Modal,
  Button,
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  RobotOutlined,
  LinkOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import NewsDetailModal from '../components/NewsDetailModal';
import { useNewsStore } from '../store/newsStoreProvider';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

const NewsList: React.FC = () => {
  const news = useNewsStore((s) => s.news);
  const loading = useNewsStore((s) => s.loading);
  const total = useNewsStore((s) => s.total);
  const fetchNews = useNewsStore((s) => s.fetchNews);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [aiFilter, setAiFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const params: Record<string, string | number> = {
      page,
      sortBy,
      sortOrder: 'DESC',
    };
    if (category !== 'all') params.category = category;
    if (search) params.search = search;
    if (aiFilter !== 'all')
      params.isAiGenerated = aiFilter === 'true' ? 'true' : 'false';
    fetchNews(params);
  }, [category, sortBy, aiFilter, page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
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

  const hasFilters = category !== 'all' || aiFilter !== 'all' || search;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Title level={2}>📰 Лента новостей</Title>
      <Space wrap style={{ marginBottom: 16 }}>
        <Search
          placeholder="Поиск..."
          allowClear
          onSearch={handleSearch}
          style={{ minWidth: 200 }}
          prefix={<SearchOutlined />}
        />
        <Select
          value={category}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
          style={{ minWidth: 160 }}
        >
          <Select.Option value="all">📂 Все</Select.Option>
          <Select.Option value="politics">🏛 Политика</Select.Option>
          <Select.Option value="economy">💹 Экономика</Select.Option>
          <Select.Option value="technology">💻 Технологии</Select.Option>
          <Select.Option value="science">🔬 Наука</Select.Option>
          <Select.Option value="sports">⚽ Спорт</Select.Option>
          <Select.Option value="entertainment">🎬 Развлечения</Select.Option>
          <Select.Option value="health">🏥 Здоровье</Select.Option>
          <Select.Option value="world">🌍 Мир</Select.Option>
        </Select>
        <Select
          value={sortBy}
          onChange={(v) => {
            setSortBy(v);
            setPage(1);
          }}
          style={{ minWidth: 140 }}
        >
          <Select.Option value="publishedAt">🕒 По дате</Select.Option>
          <Select.Option value="views">👁 По просмотрам</Select.Option>
          <Select.Option value="likes">❤️ По лайкам</Select.Option>
        </Select>
        <Select
          value={aiFilter}
          onChange={(v) => {
            setAiFilter(v);
            setPage(1);
          }}
          style={{ minWidth: 150 }}
        >
          <Select.Option value="all">📋 Все</Select.Option>
          <Select.Option value="true">🤖 AI-рерайт</Select.Option>
          <Select.Option value="false">📄 Оригиналы</Select.Option>
        </Select>
        {hasFilters && (
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              setCategory('all');
              setAiFilter('all');
              setSearch('');
              setPage(1);
            }}
            size="small"
          >
            Сбросить
          </Button>
        )}
      </Space>

      <Spin spinning={loading}>
        {news.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {news.map((item) => (
                <div key={item.id} style={{ width: '100%' }}>
                  <Card
                    hoverable
                    onClick={() => {
                      setSelectedNewsId(item.id);
                      setModalVisible(true);
                    }}
                    style={{ borderRadius: 8, marginBottom: 12 }}
                  >
                    <Text strong style={{ fontSize: 15 }}>
                      {item.title}
                    </Text>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ margin: '8px 0', color: '#666', fontSize: 13 }}
                    >
                      {item.summary ||
                        item.content?.substring(0, 150) ||
                        'Описание отсутствует'}
                    </Paragraph>
                    <Space wrap size={[4, 4]}>
                      <Tag color={getCategoryColor(item.category)}>
                        {getCategoryLabel(item.category)}
                      </Tag>
                      {item.isAiGenerated ? (
                        <Tag icon={<RobotOutlined />} color="blue">
                          AI
                        </Tag>
                      ) : (
                        <Tag icon={<LinkOutlined />} color="green">
                          Оригинал
                        </Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <EyeOutlined /> {item.views || 0}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <HeartOutlined /> {item.likes || 0}
                      </Text>
                    </Space>
                  </Card>
                </div>
              ))}
            </Row>
            {total > 12 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={12}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description={hasFilters ? 'Ничего не найдено' : 'Новостей пока нет'}
          />
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

export default NewsList;
