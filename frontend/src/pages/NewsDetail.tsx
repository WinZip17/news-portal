import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Tag, Space, Button, Spin, Empty, Divider, Card, Statistic, Breadcrumb, Image, Alert, Row, Col, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  UserOutlined,
  LinkOutlined,
  RobotOutlined,
  CalendarOutlined,
  TagOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNews } from '@/hooks/useNews';
import { getCategoryLabel } from '@/utils/getCategoryLabel.ts';

const { Title, Text } = Typography;
const { Content } = Layout;

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentNews, isLoading, error, fetchNewsById, likeNews, clearError } = useNews();

  useEffect(() => {
    if (id) {
      fetchNewsById(id);
      // Скролл вверх при открытии
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  const handleLike = () => {
    if (currentNews) {
      likeNews(currentNews.id);
    }
  };

  const handleShare = async () => {
    if (currentNews) {
      try {
        await navigator.share({
          title: currentNews.title,
          text: currentNews.summary,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback: копирование ссылки
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

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
      other: 'default',
    };
    return colors[category] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      pending: 'orange',
      published: 'green',
      rejected: 'red',
      archived: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      pending: 'На модерации',
      published: 'Опубликовано',
      rejected: 'Отклонено',
      archived: 'В архиве',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" description="Загрузка новости..." />
      </div>
    );
  }

  if (error) {
    return (
      <Empty description={<Text type="danger">Ошибка загрузки: {error}</Text>} style={{ padding: '40px 0' }}>
        <Space>
          <Button onClick={() => id && fetchNewsById(id)}>Повторить</Button>
          <Button type="link" onClick={clearError}>
            Закрыть
          </Button>
          <Button onClick={() => navigate('/news')}>К списку новостей</Button>
        </Space>
      </Empty>
    );
  }

  if (!currentNews) {
    return (
      <Empty description="Новость не найдена" style={{ padding: '40px 0' }}>
        <Button type="primary" onClick={() => navigate('/news')}>
          К списку новостей
        </Button>
      </Empty>
    );
  }

  return (
    <Content style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      {/* Хлебные крошки */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/')}>Главная</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/news')}>Новости</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{currentNews.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Шапка новости */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/news')}>
            К списку
          </Button>
        </Space>

        {/* Статус и AI метка */}
        <Space wrap style={{ marginBottom: 12 }}>
          {currentNews.isAiGenerated && (
            <Tag icon={<RobotOutlined />} color="blue">
              Сгенерировано AI
            </Tag>
          )}
          <Tag color={getStatusColor(currentNews.status)}>{getStatusLabel(currentNews.status)}</Tag>
          <Tag color={getCategoryColor(currentNews.category)}>{getCategoryLabel(currentNews.category)}</Tag>
        </Space>

        {/* Заголовок */}
        <Title level={1} style={{ marginBottom: 16, fontSize: '2.5em' }}>
          {currentNews.title}
        </Title>

        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: currentNews.isAiGenerated ? '#f0f5ff' : '#f6ffed',
            border: currentNews.isAiGenerated ? '1px solid #d6e4ff' : '1px solid #b7eb8f',
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              {currentNews.isAiGenerated ? (
                <>
                  <RobotOutlined style={{ color: '#1677ff' }} />
                  <Text strong>AI-рерайт новости</Text>
                </>
              ) : (
                <>
                  <LinkOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Оригинальная новость</Text>
                </>
              )}
            </Space>

            <Text type="secondary">
              {currentNews.isAiGenerated
                ? 'Эта новость создана с помощью искусственного интеллекта на основе реальных данных из новостных источников. Факты сохранены, формулировки изменены.'
                : 'Оригинальная новость из новостного источника.'}
            </Text>

            {currentNews.source && (
              <Text type="secondary">
                Источник: {currentNews.source}
                {currentNews.sourceUrl && (
                  <>
                    {' '}
                    •{' '}
                    <a href={currentNews.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Оригинал статьи
                    </a>
                  </>
                )}
              </Text>
            )}
          </Space>
        </Card>

        {/* Мета-информация */}
        <Space wrap size="middle" style={{ color: '#666', marginBottom: 20 }}>
          <Text type="secondary">
            <CalendarOutlined /> {formatDate(currentNews.publishedAt)}
          </Text>
          {currentNews.author && (
            <Text type="secondary">
              <UserOutlined /> {currentNews.author}
            </Text>
          )}
          {currentNews.source && (
            <Text type="secondary">
              <LinkOutlined /> {currentNews.source}
            </Text>
          )}
          <Text type="secondary">
            <EyeOutlined /> {currentNews.views} просмотров
          </Text>
        </Space>

        {/* Действия */}
        <Space>
          <Tooltip title="Нравится">
            <Button icon={<HeartOutlined />} onClick={handleLike}>
              {currentNews.likes || 0}
            </Button>
          </Tooltip>
          <Tooltip title="Поделиться">
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>
              Поделиться
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Divider />

      {/* Основное изображение */}
      {currentNews.imageUrl && (
        <div style={{ marginBottom: 24 }}>
          <Image
            src={currentNews.imageUrl}
            alt={currentNews.title}
            style={{
              width: '100%',
              maxHeight: 500,
              objectFit: 'cover',
              borderRadius: 8,
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
        </div>
      )}

      {/* Краткое описание */}
      {currentNews.summary && (
        <Card
          style={{
            marginBottom: 24,
            backgroundColor: '#f0f5ff',
            border: '1px solid #d6e4ff',
          }}
        >
          <Text strong style={{ fontSize: '16px', lineHeight: '1.8' }}>
            {currentNews.summary}
          </Text>
        </Card>
      )}

      {/* Основной контент */}
      <div style={{ marginBottom: 32 }}>
        <Typography>
          <div
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              textAlign: 'justify',
            }}
            dangerouslySetInnerHTML={{
              __html: currentNews.content || '<p>Контент отсутствует</p>',
            }}
          />
        </Typography>
      </div>

      {/* Теги */}
      {currentNews.tags && currentNews.tags.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ marginRight: 8 }}>
            <TagOutlined /> Теги:
          </Text>
          <Space wrap>
            {currentNews.tags.map((tag) => (
              <Tag key={tag} style={{ cursor: 'pointer' }}>
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <Divider />

      {/* Ссылка на источник */}
      {currentNews.source && (
        <Alert
          title="Источник"
          description={
            <div>
              <Text>
                Данная новость основана на информации из источника:{' '}
                <a href={currentNews.source} target="_blank" rel="noopener noreferrer">
                  {currentNews.source}
                </a>
              </Text>
              {currentNews.isAiGenerated && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <WarningOutlined /> Контент создан с помощью искусственного интеллекта и может требовать проверки фактов.
                  </Text>
                </div>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Просмотры" value={currentNews.views || 0} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Лайки" value={currentNews.likes || 0} prefix={<HeartOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Комментарии" value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Репосты" value={0} prefix={<ShareAltOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Кнопки навигации */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/news')}>
            ← К списку новостей
          </Button>
          <Button size="large" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑ Наверх
          </Button>
        </Space>
      </div>
    </Content>
  );
};

export default NewsDetail;
