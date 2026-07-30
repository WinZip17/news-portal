import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  LikeFilled,
  LikeOutlined,
} from '@ant-design/icons';
import { newsService } from '@/services/newsService.ts';
import { useNews } from '@/hooks/useNews.ts';
import NewsSEO from '@/components/NewsSEO.tsx';
import axios from 'axios';
import { TAG_STYLE } from '@/constants/styles.ts';
import { getCategoryColor } from '@/utils/getCategoryColor.ts';
import { formatFullDate } from '@/utils/formatDate.ts';
import { getCategoryLabel } from '@/utils/getCategoryLabel.ts';

const { Title, Text, Paragraph } = Typography;

interface Props {
  newsId: string;
}

const NewsDetailModal: React.FC<Props> = ({ newsId }) => {
  const { currentNews, isLoading, fetchNewsById, setCurrentNews } = useNews();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | null>(null);

  const seoProps = useMemo(
    () => ({
      title: currentNews?.title || '',
      summary: currentNews?.summary,
      imageUrl: currentNews?.imageUrl,
      publishedAt: currentNews?.publishedAt,
      category: currentNews?.category,
      tags: currentNews?.tags,
      author: currentNews?.author,
      url: `${window.location.origin}/?news=${currentNews?.id || ''}`,
    }),
    [currentNews?.id],
  );

  const checkLike = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const liked = await newsService.isLiked(newsId);
      setIsLiked(liked);
    } catch {
      console.error('Ошибка загрузки реакций');
    }
  }, [newsId]);

  const checkFavorite = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const favorited = await newsService.isFavorited(newsId);
      setIsFavorited(favorited);
    } catch {
      console.error('Ошибка загрузки избранного');
    }
  }, [newsId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!newsId) return;
      await fetchNewsById(newsId);
      if (!mounted) return;
      const token = localStorage.getItem('accessToken');
      if (token) {
        await Promise.all([checkFavorite(), checkLike()]);
      }
    };
    void load();
    return () => {
      mounted = false;
      setCurrentNews();
    };
  }, [newsId, fetchNewsById, checkFavorite, checkLike, setCurrentNews]);

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
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
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
    } catch (error: unknown) {
      console.error('Like error:', axios.isAxiosError(error) ? error.response?.data : error);
      message.error('Ошибка');
    }
  };

  const handleShare = async () => {
    if (!currentNews) return;
    const url = `${window.location.origin}/?news=${currentNews.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentNews.title,
          text: currentNews.summary || currentNews.title,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      message.success('Ссылка скопирована');
    } catch {
      message.error('Не удалось поделиться ссылкой');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" description="Загрузка новости..." />
      </div>
    );
  }

  if (!currentNews) {
    return <div>Новость не найдена</div>;
  }

  const displayedLikes = likesCount ?? currentNews.likes ?? 0;

  return (
    <div>
      <NewsSEO {...seoProps} />

      <Alert
        title={currentNews.isAiGenerated ? '🤖 AI-рерайт новости' : '📄 Оригинальная новость'}
        description={
          currentNews.isAiGenerated
            ? 'Эта новость создана с помощью искусственного интеллекта на основе реальных данных. Факты сохранены, формулировки изменены.'
            : 'Оригинальная новость из новостного источника.'
        }
        type={currentNews.isAiGenerated ? 'info' : 'success'}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Title level={3}>{currentNews.title}</Title>

      <Space wrap size="middle" style={{ marginBottom: 16, color: '#666' }}>
        <Text type="secondary">
          <ClockCircleOutlined /> {formatFullDate(currentNews.publishedAt)}
        </Text>
        <Text type="secondary">
          <EyeOutlined /> {currentNews.views || 0} просмотров
        </Text>
        {currentNews.author && (
          <Text type="secondary">
            <UserOutlined /> {currentNews.author}
          </Text>
        )}
      </Space>

      <Space style={{ marginBottom: 16, marginLeft: 16 }}>
        <Button icon={isLiked ? <LikeFilled /> : <LikeOutlined />} onClick={handleLike} size="small" danger={isLiked}>
          {displayedLikes}
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
        <Tag color={getCategoryColor(currentNews.category)} style={TAG_STYLE}>
          {getCategoryLabel(currentNews.category)}
        </Tag>
        {currentNews.isAiGenerated ? (
          <Tag icon={<RobotOutlined />} color="blue" style={TAG_STYLE}>
            AI-рерайт
          </Tag>
        ) : (
          <Tag icon={<LinkOutlined />} color="green" style={TAG_STYLE}>
            Оригинал
          </Tag>
        )}
        {currentNews.source && (
          <Tag color="purple" style={TAG_STYLE}>
            {currentNews.source}
          </Tag>
        )}
        {currentNews.tags?.map((tag) => (
          <Tag key={tag} style={TAG_STYLE}>
            {tag}
          </Tag>
        ))}
      </Space>

      <Divider />

      {currentNews.imageUrl && (
        <Image
          src={currentNews.imageUrl}
          alt={currentNews.title}
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      )}

      {currentNews.summary && (
        <Paragraph strong style={{ fontSize: '16px', marginBottom: 16 }}>
          {currentNews.summary}
        </Paragraph>
      )}

      <div style={{ fontSize: '15px', lineHeight: '1.8', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: currentNews.content }} />

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
