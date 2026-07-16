import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, Spin, Empty, Tag } from 'antd';
import {
    ReadOutlined,
    TeamOutlined,
    RocketOutlined,
    ArrowRightOutlined,
    RobotOutlined,
    LinkOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';
import {getCategoryLabel} from "../utils/getCategoryLabel.ts";

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { news, fetchNews, isLoading } = useNews();

    useEffect(() => {
        fetchNews({
            limit: 6,
            sortBy: 'publishedAt',
            sortOrder: 'DESC',
        });
    }, []);

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
        });
    };

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

    return (
        <div>
            {/* Hero секция */}
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
                    Персонализированная лента, факты без искажений, свежий взгляд на события.
                </Paragraph>
                <Space size="large">
                    {!isAuthenticated ? (
                        <>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/register')}
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
                                onClick={() => navigate('/login')}
                                icon={<ArrowRightOutlined />}
                                style={{ color: 'white', borderColor: 'white' }}
                            >
                                Уже есть аккаунт
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate('/news')}
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
            <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
                <Col xs={24} sm={8}>
                    <Card hoverable>
                        <Statistic
                            title="Новостей сегодня"
                            value={news.length}
                            prefix={<ReadOutlined />}
                            suffix="новостей"
                            loading={isLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card hoverable>
                        <Statistic
                            title="Пользователей"
                            value={1523}
                            prefix={<TeamOutlined />}
                            suffix="человек"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card hoverable>
                        <Statistic
                            title="AI-рерайт"
                            value={856}
                            prefix={<RobotOutlined />}
                            suffix="новостей"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Последние новости */}
            <div style={{ marginBottom: 24 }}>
                <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                    <Title level={2} style={{ margin: 0 }}>
                        Последние новости
                    </Title>
                    <Button
                        type="link"
                        onClick={() => navigate('/news')}
                        icon={<ArrowRightOutlined />}
                    >
                        Все новости
                    </Button>
                </Space>

                <Spin spinning={isLoading}>
                    {news.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {news.slice(0, 6).map((item) => (
                                <Col xs={24} sm={12} lg={8} key={item.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            item.imageUrl ? (
                                                <img
                                                    alt={item.title}
                                                    src={item.imageUrl}
                                                    style={{ height: 200, objectFit: 'cover' }}
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
                                        onClick={() => window.open(`/news/${item.id}`, '_blank')}
                                        actions={[
                                            <span key="views">👁 {item.views || 0}</span>,
                                            <span key="likes">❤️ {item.likes || 0}</span>,
                                        ]}
                                    >
                                        <Card.Meta
                                            title={item.title}
                                            description={
                                                <>
                                                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                                                        {item.summary?.substring(0, 120) || 'Описание отсутствует'}...
                                                    </Paragraph>

                                                    <Space wrap size={[4, 4]}>
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
                                                    </Space>

                                                    <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                                                        <ClockCircleOutlined /> {formatDate(item.publishedAt)}
                                                    </div>
                                                </>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        !isLoading && (
                            <Empty
                                description="Новости пока не загружены"
                                style={{ padding: '40px 0' }}
                            >
                                <Button type="primary" onClick={() => fetchNews({ limit: 6 })}>
                                    Загрузить новости
                                </Button>
                            </Empty>
                        )
                    )}
                </Spin>
            </div>

            {/* Информация о сервисе */}
            <Row gutter={[24, 24]} style={{ marginTop: 48 }}>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>🤖 AI-рерайт</Title>
                        <Paragraph>
                            Мы используем искусственный интеллект для переработки новостей из проверенных источников.
                            Факты сохраняются, формулировки становятся уникальными.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>📰 Реальные источники</Title>
                        <Paragraph>
                            Все новости основаны на материалах ведущих информационных агентств:
                            РИА Новости, ТАСС, Интерфакс, РБК и других.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>⚡ Каждый час</Title>
                        <Paragraph>
                            Новости обновляются автоматически каждый час. Вы всегда в курсе
                            последних событий в мире политики, экономики, технологий и науки.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;