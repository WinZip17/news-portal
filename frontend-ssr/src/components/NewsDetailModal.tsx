import React, { useEffect, useState } from 'react';
import {
  Spin,
  Typography,
  Tag,
  Space,
  Divider,
  Image,
  Alert,
  Button,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  RobotOutlined,
  LinkOutlined,
  UserOutlined,
  ShareAltOutlined,
  LikeFilled,
  LikeOutlined,
} from '@ant-design/icons';
import { newsService } from '../services/news.service';
import type { News } from '../types';
import { useUserStore } from '../store/userStoreProvider';

const { Title, Text, Paragraph } = Typography;

const NewsDetailModal: React.FC<{ newsId: string }> = ({ newsId }) => {
  const [news, setNews] = useState<News | null>(null);
  const user = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    loadNews();
  }, [newsId]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.fetchById(newsId);
      setNews(data);
      setLikesCount(data.likes || 0);
    } catch {
      message.error('Ошибка загрузки новостей');
    }
    checkLike();
    checkFavorite();
    setLoading(false);
  };

  const checkLike = async () => {
    if (!user) return;
    try {
      const liked = await newsService.isLiked(newsId);
      setIsLiked(liked);
    } catch {
      message.error('Ошибка запроса checkLike');
    }
  };

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const favorited = await newsService.isFavorited(newsId);
      setIsFavorited(favorited);
    } catch {
      message.error('Ошибка запроса checkFavorite');
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.info('Войдите, чтобы ставить лайки');
      return;
    }
    try {
      const result = await newsService.toggleLike(newsId);
      setIsLiked(result.liked);
      setLikesCount(result.likes);
    } catch {
      message.error('Ошибка');
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.info('Войдите, чтобы добавлять в избранное');
      return;
    }
    try {
      const result = await newsService.toggleFavorite(newsId);
      setIsFavorited(result.favorited);
      message.success(
        result.favorited ? 'Добавлено в избранное' : 'Удалено из избранного',
      );
    } catch {
      message.error('Ошибка');
    }
  };

  const handleShare = async () => {
    if (news) {
      const url = `${window.location.origin}/?news=${news.id}`;
      try {
        await navigator.share({ title: news.title, text: news.summary, url });
      } catch {
        await navigator.clipboard.writeText(url);
        message.success('Ссылка скопирована');
      }
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  if (!news) return <div>Новость не найдена</div>;

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

  return (
    <div>
      <Alert
        title={
          news.isAiGenerated
            ? '🤖 AI-рерайт новости'
            : '📄 Оригинальная новость'
        }
        description={
          news.isAiGenerated
            ? 'Эта новость создана с помощью искусственного интеллекта на основе реальных данных. Факты сохранены, формулировки изменены.'
            : 'Оригинальная новость из новостного источника.'
        }
        type={news.isAiGenerated ? 'info' : 'success'}
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Title level={3}>{news.title}</Title>
      <Space wrap size="middle" style={{ marginBottom: 16, color: '#666' }}>
        <Text type="secondary">
          <ClockCircleOutlined />{' '}
          {new Date(news.publishedAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text type="secondary">
          <EyeOutlined /> {news.views || 0} просмотров
        </Text>
        {news.author && (
          <Text type="secondary">
            <UserOutlined /> {news.author}
          </Text>
        )}
      </Space>

      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
          onClick={handleLike}
          size="small"
          danger={isLiked}
        >
          {likesCount || news.likes || 0}
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
        <Button icon={<ShareAltOutlined />} onClick={handleShare} size="small">
          Поделиться
        </Button>
      </Space>

      <Space wrap style={{ marginBottom: 16 }}>
        <Tag color={getCategoryColor(news.category)}>
          {getCategoryLabel(news.category)}
        </Tag>
        {news.isAiGenerated ? (
          <Tag icon={<RobotOutlined />} color="blue">
            AI-рерайт
          </Tag>
        ) : (
          <Tag icon={<LinkOutlined />} color="green">
            Оригинал
          </Tag>
        )}
        {news.source && <Tag color="purple">{news.source}</Tag>}
        {news.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>

      <Divider />
      {news.imageUrl && (
        <Image
          src={news.imageUrl}
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
      {news.summary && (
        <Paragraph strong style={{ fontSize: 16, marginBottom: 16 }}>
          {news.summary}
        </Paragraph>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: news.content }}
        style={{ fontSize: 15, lineHeight: 1.8, textAlign: 'justify' }}
      />
      {news.sourceUrl && (
        <div style={{ marginTop: 16 }}>
          <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer">
            Читать оригинал на {news.source || 'источнике'}
          </a>
        </div>
      )}
    </div>
  );
};

export default NewsDetailModal;
