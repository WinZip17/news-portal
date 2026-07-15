import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, Spin, Empty } from 'antd';
import { ReadOutlined, TeamOutlined, RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { news, fetchNews, isLoading } = useNews();

    useEffect(() => {
        fetchNews({
            limit: 6,
            sortBy: 'publishedAt',
            sortOrder: 'DESC'
        });
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                    📰 Добро пожаловать на News Portal
                </Title>
                <Paragraph
                    style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.2em',
                        marginBottom: 32,
                    }}
                >
                    Актуальные новости, созданные с помощью искусственного интеллекта.
                    Персонализированная лента, умные рекомендации и многое другое!
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
                            title="AI-новостей"
                            value={856}
                            prefix={<RocketOutlined />}
                            suffix="сгенерировано"
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
                                        onClick={() => navigate(`/news/${item.id}`)}
                                        actions={[
                                            <span key="views">👁 {item.views || 0}</span>,
                                            <span key="likes">❤️ {item.likes || 0}</span>,
                                            <span key="comments">💬 {0}</span>,
                                        ]}
                                    >
                                        <Card.Meta
                                            title={item.title}
                                            description={
                                                <>
                                                    <p>{item.summary?.substring(0, 120)}...</p>
                                                    <div
                                                        style={{
                                                            marginTop: 12,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            color: '#999',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        <span>{formatDate(item.publishedAt)}</span>
                                                        {item.isAiGenerated && (
                                                            <span
                                                                style={{
                                                                    background: '#f0f5ff',
                                                                    color: '#2f54eb',
                                                                    padding: '2px 8px',
                                                                    borderRadius: 4,
                                                                    fontSize: '11px',
                                                                }}
                                                            >
                                AI
                              </span>
                                                        )}
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

            {/* Дополнительная информация */}
            <Row gutter={[24, 24]} style={{ marginTop: 48 }}>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>🤖 AI-генерация</Title>
                        <Paragraph>
                            Новости создаются и обновляются каждый час с помощью
                            передовых алгоритмов искусственного интеллекта
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>👤 Персонализация</Title>
                        <Paragraph>
                            Настройте свою ленту новостей под ваши интересы и
                            получайте только то, что вам действительно важно
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <Title level={4}>🛡 Модерация</Title>
                        <Paragraph>
                            Каждая новость проходит проверку модераторами для
                            обеспечения высокого качества контента
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;