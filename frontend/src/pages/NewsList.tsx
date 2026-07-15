import React, {useEffect, useCallback} from 'react';
import {
    Card,
    Row,
    Col,
    Input,
    Select,
    Tag,
    Space,
    Pagination,
    Empty,
    Spin,
    Typography,
    Divider,
    Badge,
    Tooltip,
    Button
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    HeartOutlined, ReadOutlined,
} from '@ant-design/icons';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useNews} from '../hooks/useNews';
import {NewsCategory, NewsFilter} from '../types/news';

const {Search} = Input;
const {Option} = Select;
const {Title, Text, Paragraph} = Typography;

const NewsList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        news,
        isLoading,
        pagination,
        filters,
        fetchNews,
        setFilters,
        error,
        clearError,
    } = useNews();

    // Загрузка новостей при монтировании и изменении фильтров
    useEffect(() => {
        // Синхронизация URL параметров с фильтрами
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

        setFilters(urlFilters);
        fetchNews({...filters, ...urlFilters});
    }, [searchParams]);

    // Обработчик поиска
    const handleSearch = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        newParams.delete('page'); // Сбрасываем страницу при поиске
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Обработчик изменения категории
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

    // Обработчик изменения сортировки
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

    // Обработчик изменения страницы
    const handlePageChange = useCallback((page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [searchParams, setSearchParams]);

    // Обработчик очистки фильтров
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

        if (diffMins < 60) {
            return `${diffMins} мин. назад`;
        } else if (diffHours < 24) {
            return `${diffHours} ч. назад`;
        } else if (diffDays < 7) {
            return `${diffDays} дн. назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    };

    const hasActiveFilters = searchParams.toString().length > 0;

    return (
        <div>
            {/* Заголовок и фильтры */}
            <div style={{marginBottom: 24}}>
                <Title level={2} style={{marginBottom: 16}}>
                    <ReadOutlined/> Новости
                </Title>

                <Space wrap size="middle" style={{width: '100%'}}>
                    <Search
                        placeholder="Поиск новостей..."
                        allowClear
                        onSearch={handleSearch}
                        defaultValue={searchParams.get('search') || ''}
                        style={{minWidth: 250}}
                        prefix={<SearchOutlined/>}
                    />

                    <Select
                        value={searchParams.get('category') || 'all'}
                        style={{minWidth: 180}}
                        onChange={handleCategoryChange}
                        prefix={<FilterOutlined/>}
                    >
                        <Option value="all">Все категории</Option>
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
                        style={{minWidth: 180}}
                        onChange={handleSortChange}
                        prefix={<SortAscendingOutlined/>}
                    >
                        <Option value="publishedAt">По дате</Option>
                        <Option value="views">По просмотрам</Option>
                        <Option value="likes">По лайкам</Option>
                    </Select>

                    {hasActiveFilters && (
                        <Text
                            type="secondary"
                            style={{cursor: 'pointer', textDecoration: 'underline'}}
                            onClick={handleClearFilters}
                        >
                            Сбросить фильтры
                        </Text>
                    )}
                </Space>
            </div>

            <Divider/>

            {/* Список новостей */}
            <Spin spinning={isLoading} tip="Загрузка новостей...">
                {error ? (
                    <Empty
                        description={
                            <Text type="danger">
                                Ошибка загрузки новостей: {error}
                            </Text>
                        }
                    >
                        <Space>
                            <Button onClick={() => fetchNews(filters)}>
                                Повторить попытку
                            </Button>
                            <Button type="link" onClick={clearError}>
                                Закрыть
                            </Button>
                        </Space>
                    </Empty>
                ) : news.length > 0 ? (
                    <>
                        <Row gutter={[24, 24]}>
                            {news.map((item) => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                                    <Badge.Ribbon
                                        text={item.isAiGenerated ? 'AI' : null}
                                        color="blue"
                                        style={{display: item.isAiGenerated ? 'block' : 'none'}}
                                    >
                                        <Card
                                            hoverable
                                            cover={
                                                item.imageUrl ? (
                                                    <img
                                                        alt={item.title}
                                                        src={item.imageUrl}
                                                        style={{height: 200, objectFit: 'cover'}}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            height: 200,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '48px',
                                                        }}
                                                    >
                                                        📰
                                                    </div>
                                                )
                                            }
                                            onClick={() => navigate(`/news/${item.id}`)}
                                            actions={[
                                                <Tooltip title="Просмотры" key="views">
                                                    <Space size="small">
                                                        <EyeOutlined/>
                                                        {item.views || 0}
                                                    </Space>
                                                </Tooltip>,
                                                <Tooltip title="Лайки" key="likes">
                                                    <Space size="small">
                                                        <HeartOutlined/>
                                                        {item.likes || 0}
                                                    </Space>
                                                </Tooltip>,
                                            ]}
                                        >
                                            <Card.Meta
                                                title={
                                                    <Text ellipsis={{tooltip: item.title}}>
                                                        {item.title}
                                                    </Text>
                                                }
                                                description={
                                                    <>
                                                        <Paragraph
                                                            ellipsis={{rows: 3}}
                                                            style={{marginBottom: 12}}
                                                        >
                                                            {item.summary || 'Описание отсутствует'}
                                                        </Paragraph>

                                                        <Space wrap size={[0, 8]} style={{marginBottom: 8}}>
                                                            <Tag color={getCategoryColor(item.category)}>
                                                                {getCategoryLabel(item.category)}
                                                            </Tag>
                                                            {item.tags?.slice(0, 2).map((tag) => (
                                                                <Tag key={tag} style={{fontSize: '11px'}}>
                                                                    {tag}
                                                                </Tag>
                                                            ))}
                                                        </Space>

                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                color: '#999',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            <Tooltip
                                                                title={new Date(item.publishedAt).toLocaleString('ru-RU')}>
                                                                <Space size="small">
                                                                    <ClockCircleOutlined/>
                                                                    {formatDate(item.publishedAt)}
                                                                </Space>
                                                            </Tooltip>

                                                            {item.author && (
                                                                <Text type="secondary" style={{fontSize: '12px'}}>
                                                                    {item.author}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            ))}
                        </Row>

                        {/* Пагинация */}
                        {pagination.totalPages > 1 && (
                            <div style={{textAlign: 'center', marginTop: 32, marginBottom: 24}}>
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
                        style={{padding: '40px 0'}}
                    >
                        {hasActiveFilters ? (
                            <Space>
                                <Button onClick={handleClearFilters}>
                                    Сбросить фильтры
                                </Button>
                                <Button type="primary" onClick={() => fetchNews({})}>
                                    Показать все новости
                                </Button>
                            </Space>
                        ) : (
                            <Button onClick={() => fetchNews()}>
                                Обновить
                            </Button>
                        )}
                    </Empty>
                )}
            </Spin>
        </div>
    );
};

export default NewsList;