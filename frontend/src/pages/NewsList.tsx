import React, { useEffect, useCallback } from 'react';
import {
    List,
    Input,
    Select,
    Tag,
    Space,
    Pagination,
    Empty,
    Spin,
    Typography,
    Divider,
    Button,
    Tooltip,
    Modal,
} from 'antd';
import {
    SearchOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    HeartOutlined,
    LinkOutlined,
    RobotOutlined,
    ClearOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useNews } from '../hooks/useNews';
import { NewsCategory, NewsFilter } from '../types/news';
import NewsDetailModal from '../components/NewsDetailModal';
import {useNewsModal} from "../hooks/useNewsModal.ts";

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const NewsList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedNewsId, modalVisible, openNews, closeNews } = useNewsModal();

    const {
        news,
        isLoading,
        pagination,
        fetchNews,
        setFilters,
        error,
        clearError,
    } = useNews();

    // Загрузка новостей
    useEffect(() => {
        const urlFilters: NewsFilter = {};

        const category = searchParams.get('category');
        if (category && Object.values(NewsCategory).includes(category as NewsCategory)) {
            urlFilters.category = category as NewsCategory;
        }

        const search = searchParams.get('search');
        if (search) {
            urlFilters.search = search;
        }

        const page = searchParams.get('page');
        if (page) {
            urlFilters.page = parseInt(page, 10);
        }

        const sortBy = searchParams.get('sortBy');
        if (sortBy) {
            urlFilters.sortBy = sortBy as any;
        }

        const isAiGenerated = searchParams.get('isAiGenerated');
        if (isAiGenerated !== null && isAiGenerated !== 'all') {
            urlFilters.isAiGenerated = isAiGenerated === 'true';
        }

        setFilters(urlFilters);
        fetchNews({ ...pagination, ...urlFilters });
    }, [searchParams]);

    // Обработчики фильтров
    const handleSearch = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleCategoryChange = useCallback((category: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (category && category !== 'all') {
            newParams.set('category', category);
        } else {
            newParams.delete('category');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleSortChange = useCallback((sortBy: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (sortBy && sortBy !== 'publishedAt') {
            newParams.set('sortBy', sortBy);
        } else {
            newParams.delete('sortBy');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleAiFilterChange = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'all') {
            newParams.set('isAiGenerated', value);
        } else {
            newParams.delete('isAiGenerated');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handlePageChange = useCallback((page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [searchParams, setSearchParams]);

    const handleClearFilters = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

    // Вспомогательные функции
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            politics: 'blue',
            economy: 'green',
            technology: 'purple',
            science: 'cyan',
            sports: 'orange',
            entertainment: 'magenta',
            health: 'red',
            world: 'geekblue',
            other: 'default',
        };
        return colors[category] || 'default';
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            politics: 'Политика',
            economy: 'Экономика',
            technology: 'Технологии',
            science: 'Наука',
            sports: 'Спорт',
            entertainment: 'Развлечения',
            health: 'Здоровье',
            world: 'Мир',
            other: 'Другое',
        };
        return labels[category] || category;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays < 7) return `${diffDays} дн. назад`;

        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const hasActiveFilters = searchParams.toString().length > 0;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Заголовок и фильтры */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ marginBottom: 16 }}>
                    📰 Лента новостей
                </Title>

                <Space wrap size="middle" style={{ width: '100%' }}>
                    <Search
                        placeholder="Поиск по заголовкам..."
                        allowClear
                        onSearch={handleSearch}
                        defaultValue={searchParams.get('search') || ''}
                        style={{ minWidth: 250 }}
                        prefix={<SearchOutlined />}
                    />

                    <Select
                        value={searchParams.get('category') || 'all'}
                        style={{ minWidth: 180 }}
                        onChange={handleCategoryChange}
                    >
                        <Option value="all">📂 Все категории</Option>
                        <Option value={NewsCategory.POLITICS}>🏛 Политика</Option>
                        <Option value={NewsCategory.ECONOMY}>💹 Экономика</Option>
                        <Option value={NewsCategory.TECHNOLOGY}>💻 Технологии</Option>
                        <Option value={NewsCategory.SCIENCE}>🔬 Наука</Option>
                        <Option value={NewsCategory.SPORTS}>⚽ Спорт</Option>
                        <Option value={NewsCategory.ENTERTAINMENT}>🎬 Развлечения</Option>
                        <Option value={NewsCategory.HEALTH}>🏥 Здоровье</Option>
                        <Option value={NewsCategory.WORLD}>🌍 Мир</Option>
                    </Select>

                    <Select
                        value={searchParams.get('sortBy') || 'publishedAt'}
                        style={{ minWidth: 180 }}
                        onChange={handleSortChange}
                    >
                        <Option value="publishedAt">🕒 По дате</Option>
                        <Option value="views">👁 По просмотрам</Option>
                        <Option value="likes">❤️ По лайкам</Option>
                    </Select>

                    <Select
                        value={searchParams.get('isAiGenerated') || 'all'}
                        style={{ minWidth: 180 }}
                        onChange={handleAiFilterChange}
                    >
                        <Option value="all">📋 Все новости</Option>
                        <Option value="true">🤖 AI-рерайт</Option>
                        <Option value="false">📄 Оригиналы</Option>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            size="small"
                        >
                            Сбросить фильтры
                        </Button>
                    )}
                </Space>

                {hasActiveFilters && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        Показаны результаты с фильтрами
                    </Text>
                )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Список новостей */}
            <Spin spinning={isLoading} tip="Загрузка новостей...">
                {error ? (
                    <Empty
                        description={<Text type="danger">Ошибка загрузки: {error}</Text>}
                    >
                        <Space>
                            <Button onClick={() => fetchNews(pagination)}>Повторить</Button>
                            <Button type="link" onClick={clearError}>Закрыть</Button>
                        </Space>
                    </Empty>
                ) : news.length > 0 ? (
                    <>
                        <List
                            itemLayout="vertical"
                            size="large"
                            dataSource={news}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.id}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '16px 0',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    onClick={() => openNews(item.id)}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {item.title}
                                                </Text>
                                                <Space size="middle" style={{ flexShrink: 0, marginLeft: 16 }}>
                                                    <Tooltip title="Просмотры">
                                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                                            <EyeOutlined /> {item.views || 0}
                                                        </Text>
                                                    </Tooltip>
                                                    <Tooltip title="Лайки">
                                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                                            <HeartOutlined /> {item.likes || 0}
                                                        </Text>
                                                    </Tooltip>
                                                </Space>
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                <Paragraph
                                                    ellipsis={{ rows: 2 }}
                                                    style={{
                                                        marginBottom: 8,
                                                        color: '#666',
                                                        fontSize: '14px',
                                                        lineHeight: '1.6',
                                                    }}
                                                >
                                                    {item.summary || item.content?.substring(0, 200) || 'Описание отсутствует'}
                                                </Paragraph>

                                                <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                                                    <Tag color={getCategoryColor(item.category)}>
                                                        {getCategoryLabel(item.category)}
                                                    </Tag>

                                                    {item.isAiGenerated ? (
                                                        <Tag icon={<RobotOutlined />} color="blue">AI-рерайт</Tag>
                                                    ) : (
                                                        <Tag icon={<LinkOutlined />} color="green">Оригинал</Tag>
                                                    )}

                                                    {item.source && (
                                                        <Tag color="purple">{item.source}</Tag>
                                                    )}

                                                    {item.tags?.slice(0, 3).map((tag) => (
                                                        <Tag key={tag} style={{ fontSize: '11px' }}>{tag}</Tag>
                                                    ))}

                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                                                    </Text>

                                                    {item.author && (
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            • {item.author}
                                                        </Text>
                                                    )}
                                                </Space>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        {/* Пагинация */}
                        {pagination.totalPages > 1 && (
                            <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 24 }}>
                                <Pagination
                                    current={pagination.page}
                                    total={pagination.total}
                                    pageSize={pagination.limit}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showQuickJumper
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} из ${total} новостей`
                                    }
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <Empty
                        description={
                            hasActiveFilters
                                ? 'Новости по вашему запросу не найдены'
                                : 'Новости пока не добавлены'
                        }
                        style={{ padding: '40px 0' }}
                    >
                        {hasActiveFilters ? (
                            <Button onClick={handleClearFilters}>
                                Сбросить фильтры и показать все
                            </Button>
                        ) : (
                            <Button onClick={() => fetchNews()}>
                                Обновить список
                            </Button>
                        )}
                    </Empty>
                )}
            </Spin>

            {/* Модальное окно с новостью */}
            <Modal
                open={modalVisible}
                onCancel={closeNews}
                footer={null}
                width={900}
                centered
                destroyOnClose
                style={{ top: 20 }}
            >
                {selectedNewsId && <NewsDetailModal newsId={selectedNewsId} />}
            </Modal>
        </div>
    );
};

export default NewsList;