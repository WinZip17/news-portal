import React, { useEffect, useState } from 'react';
import { Spin, Typography, Tag, Space, Divider, Image, Alert, Button, message } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  RobotOutlined,
  LinkOutlined,
  UserOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useNews } from '../hooks/useNews';
import { newsService } from '../services/newsService';

const { Title, Text, Paragraph } = Typography;

interface Props {
  newsId: string;
}

const NewsDetailModal: React.FC<Props> = ({ newsId }) => {
  const { currentNews, isLoading, fetchNewsById, likeNews } = useNews();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (newsId) {
      fetchNewsById(newsId);
      checkFavorite();
    }
  }, [newsId]);

  const checkFavorite = async () => {
    try {
      const favorited = await newsService.isFavorited(newsId);
      setIsFavorited(favorited);
    } catch {
      // Не авторизован — не показываем избранное
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await newsService.toggleFavorite(newsId);
      setIsFavorited(result.favorited);
      message.success(result.favorited ? 'Добавлено в избранное' : 'Удалено из избранного');
    } catch {
      message.error('Ошибка');
    }
  };

  const handleLike = () => {
    if (currentNews) {
      likeNews(currentNews.id);
    }
  };

  const handleShare = async () => {
    if (currentNews) {
      const url = `${window.location.origin}/?news=${currentNews.id}`;
      try {
        await navigator.share({
          title: currentNews.title,
          text: currentNews.summary,
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
        message.success('Ссылка скопирована');
      }
    }
  };

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

      {/* Кнопки действий */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<HeartOutlined />}
          onClick={handleLike}
          size="small"
        >
          Нравится
        </Button>
        <Button
          icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
          onClick={handleToggleFavorite}
          size="small"
          type={isFavorited ? 'primary' : 'default'}
          danger={isFavorited}
        >
          {isFavorited ? 'В избранном' : 'В избранное'}
        </Button>
        <Button
          icon={<ShareAltOutlined />}
          onClick={handleShare}
          size="small"
        >
          Поделиться
        </Button>
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