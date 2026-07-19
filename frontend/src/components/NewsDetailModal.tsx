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
  ShareAltOutlined, LikeFilled, LikeOutlined,
} from '@ant-design/icons';
import { useNews } from '../hooks/useNews';
import { newsService } from '../services/newsService';
import NewsSEO from './NewsSEO.tsx'

const { Title, Text, Paragraph } = Typography;

interface Props {
  newsId: string;
}

const NewsDetailModal: React.FC<Props> = ({ newsId }) => {
  const { currentNews, isLoading, fetchNewsById } = useNews();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (newsId) {
      fetchNewsById(newsId);
      checkFavorite();
      checkLike();
    }
  }, [newsId]);

  const checkLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const liked = await newsService.isLiked(newsId);
      setIsLiked(liked);
    } catch {}
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const favorited = await newsService.isFavorited(newsId);
      setIsFavorited(favorited);
    } catch {
      // Не авторизован — не показываем
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
      message.success(result.favorited ? 'Добавлено в избранное' : 'Удалено из избранного');
    } catch (error: any) {
      if (error?.response?.status === 401) {
        message.info('Войдите, чтобы добавлять в избранное');
      } else {
        message.error('Ошибка');
      }
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.info('Войдите, чтобы ставить лайки');
      return;
    }
    try {
      const result = await newsService.toggleLike(newsId);
      setIsLiked(result.liked);
      setLikesCount(result.likes);
      console.log('result', result)
      if (currentNews) {
        // currentNews.likes = result.likes;
      }
    } catch (error: any) {
      console.error('Like error:', error?.response?.data || error);
      message.error('Ошибка');
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
        <Spin size="large" description="Загрузка новости..."/>
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
      <NewsSEO
        title={currentNews.title}
        summary={currentNews.summary}
        imageUrl={currentNews.imageUrl}
        publishedAt={currentNews.publishedAt}
        category={currentNews.category}
        tags={currentNews.tags}
        author={currentNews.author}
        url={`${window.location.origin}/?news=${currentNews.id}`}
      />
      {/* Тип новости */}
      <Alert
        title={
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
          <ClockCircleOutlined/> {formatDate(currentNews.publishedAt)}
        </Text>
        <Text type="secondary">
          <EyeOutlined/> {currentNews.views || 0} просмотров
        </Text>
        {currentNews.author && (
          <Text type="secondary">
            <UserOutlined/> {currentNews.author}
          </Text>
        )}
      </Space>

      {/* Кнопки действий */}
      <Space style={{ marginBottom: 16, marginLeft: 16 }}>
        <Button
          icon={isLiked ? <LikeFilled/> : <LikeOutlined/>}
          onClick={handleLike}
          size="small"
          danger={isLiked}
        >
          {likesCount || currentNews?.likes || 0}
        </Button>
        <Button
          icon={isFavorited ? <HeartFilled/> : <HeartOutlined/>}
          onClick={handleToggleFavorite}
          size="small"
          type={isFavorited ? 'primary' : 'default'}
          danger={isFavorited}
        >
          {isFavorited ? 'В избранном' : 'В избранное'}
        </Button>
        <Button
          icon={<ShareAltOutlined/>}
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
          <Tag icon={<RobotOutlined/>} color="blue">AI-рерайт</Tag>
        ) : (
          <Tag icon={<LinkOutlined/>} color="green">Оригинал</Tag>
        )}
        {currentNews.source && (
          <Tag color="purple">{currentNews.source}</Tag>
        )}
        {currentNews.tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>

      <Divider/>

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