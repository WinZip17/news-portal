import React, { useEffect } from 'react';
import { Spin, Typography, Tag, Space, Divider, Image, Alert } from 'antd';
import {
    ClockCircleOutlined,
    EyeOutlined,
    HeartOutlined,
    RobotOutlined,
    LinkOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNews } from '../hooks/useNews';

const { Title, Text, Paragraph } = Typography;

interface Props {
    newsId: string;
}

const NewsDetailModal: React.FC<Props> = ({ newsId }) => {
    const { currentNews, isLoading, fetchNewsById, clearError } = useNews();

    useEffect(() => {
        if (newsId) {
            fetchNewsById(newsId);
        }
    }, [newsId]);

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" tip="Загрузка новости..." />
            </div>
        );
    }

    if (!currentNews) {
        return <div>Новость не найдена</div>;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
        };
        return labels[category] || category;
    };

    return (
        <div>
            {/* Тип новости */}
            <Alert
                message={
                    currentNews.isAiGenerated
                        ? '🤖 AI-рерайт новости'
                        : '📄 Оригинальная новость'
                }
                description={
                    currentNews.isAiGenerated
                        ? 'Эта новость создана с помощью искусственного интеллекта на основе реальных данных. Факты сохранены, формулировки изменены.'
                        : 'Оригинальная новость из новостного источника.'
                }
                type={currentNews.isAiGenerated ? 'info' : 'success'}
                showIcon
                style={{ marginBottom: 16 }}
            />

            {/* Заголовок */}
            <Title level={3}>{currentNews.title}</Title>

            {/* Мета-информация */}
            <Space wrap size="middle" style={{ marginBottom: 16, color: '#666' }}>
                <Text type="secondary">
                    <ClockCircleOutlined /> {formatDate(currentNews.publishedAt)}
                </Text>
                <Text type="secondary">
                    <EyeOutlined /> {currentNews.views || 0} просмотров
                </Text>
                <Text type="secondary">
                    <HeartOutlined /> {currentNews.likes || 0} лайков
                </Text>
                {currentNews.author && (
                    <Text type="secondary">
                        <UserOutlined /> {currentNews.author}
                    </Text>
                )}
            </Space>

            {/* Теги */}
            <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={getCategoryColor(currentNews.category)}>
                    {getCategoryLabel(currentNews.category)}
                </Tag>
                {currentNews.isAiGenerated ? (
                    <Tag icon={<RobotOutlined />} color="blue">AI-рерайт</Tag>
                ) : (
                    <Tag icon={<LinkOutlined />} color="green">Оригинал</Tag>
                )}
                {currentNews.source && (
                    <Tag color="purple">{currentNews.source}</Tag>
                )}
                {currentNews.tags?.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                ))}
            </Space>

            <Divider />

            {/* Изображение */}
            {currentNews.imageUrl && (
                <Image
                    src={currentNews.imageUrl}
                    alt={currentNews.title}
                    style={{
                        width: '100%',
                        maxHeight: 400,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 16,
                    }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
            )}

            {/* Краткое описание */}
            {currentNews.summary && (
                <Paragraph strong style={{ fontSize: '16px', marginBottom: 16 }}>
                    {currentNews.summary}
                </Paragraph>
            )}

            {/* Основной контент */}
            <div
                style={{
                    fontSize: '15px',
                    lineHeight: '1.8',
                    textAlign: 'justify',
                }}
                dangerouslySetInnerHTML={{ __html: currentNews.content }}
            />

            {/* Источник */}
            {currentNews.sourceUrl && (
                <div style={{ marginTop: 16 }}>
                    <a href={currentNews.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Читать оригинал на {currentNews.source || 'источнике'}
                    </a>
                </div>
            )}
        </div>
    );
};

export default NewsDetailModal;