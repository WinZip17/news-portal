import React, { useEffect, useState } from 'react';
import { Typography, Box, Chip, Alert, Button, Skeleton, Divider, Snackbar } from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Favorite,
  FavoriteBorder,
  Share,
  SmartToy as AIIcon,
  OpenInNew as SourceIcon,
} from '@mui/icons-material';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import { useAppSelector } from '@/store';
import { getCategoryLabel } from '@/utils/getCategoryLabel'

interface Props {
  news: News;
}

export default function NewsDetail({ news: initialNews }: Props) {
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [likesCount, setLikesCount] = useState(initialNews.likes);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    checkState();
    loadFullNews();
  }, []);

  const checkState = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const [liked, favorited] = await Promise.all([
        newsService.isLiked(news.id),
        newsService.isFavorited(news.id),
      ]);
      setIsLiked(liked);
      setIsFavorited(favorited);
    } catch {}
  };

  const loadFullNews = async () => {
    setLoading(true);
    try {
      const fullNews = await newsService.getNewsById(news.id);
      setNews(fullNews);
      setLikesCount(fullNews.likes);
    } catch {}
    setLoading(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setSnackbar('Войдите, чтобы ставить лайки');
      return;
    }
    try {
      const result = await newsService.toggleLike(news.id);
      setIsLiked(result.liked);
      setLikesCount(result.likes);
    } catch {}
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      setSnackbar('Войдите, чтобы добавлять в избранное');
      return;
    }
    try {
      const result = await newsService.toggleFavorite(news.id);
      setIsFavorited(result.favorited);
    } catch {}
  };

  const handleShare = async () => {
    if (news) {
      const url = `${window.location.origin}/?news=${news.id}`;
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
        setSnackbar('Ссылка скопирована');
      }
    }
  };

  if (loading) return <Skeleton variant="rectangular" height={400} />;

  return (
    <Box>
      <Alert severity={news.isAiGenerated ? 'info' : 'success'} sx={{ mb: 2 }}>
        {news.isAiGenerated ? '🤖 AI-рерайт новости' : '📄 Оригинальная новость'}
      </Alert>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
      <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
        {news.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
        <Typography variant="body2">
          📅 {new Date(news.publishedAt).toLocaleDateString('ru-RU')}
        </Typography>
        <Typography variant="body2">👁 {news.views} просмотров</Typography>
        {news.author && <Typography variant="body2">✍️ {news.author}</Typography>}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          size="small"
          startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
          onClick={handleLike}
          color={isLiked ? 'primary' : 'inherit'}
        >
          {likesCount}
        </Button>
        <Button
          size="small"
          startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
          onClick={handleFavorite}
          color={isFavorited ? 'error' : 'inherit'}
        >
          {isFavorited ? 'В избранном' : 'В избранное'}
        </Button>
        <Button size="small" startIcon={<Share />} onClick={handleShare}>
          Поделиться
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={getCategoryLabel(news.category)} size="small" color="primary" />
        {news.isAiGenerated && (
          <Chip icon={<AIIcon />} label="AI-рерайт" size="small" color="secondary" />
        )}
        {news.source && (
          <Chip icon={<SourceIcon />} label={news.source} size="small" variant="outlined" />
        )}
        {news.tags?.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {news.imageUrl && (
        <Box
          component="img"
          src={news.imageUrl}
          alt={news.title}
          sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, mb: 2 }}
        />
      )}

      {news.summary && (
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          {news.summary}
        </Typography>
      )}

      <Box
        dangerouslySetInnerHTML={{ __html: news.content }}
        sx={{ '& p': { mb: 1.5, lineHeight: 1.8 }, '& img': { maxWidth: '100%', borderRadius: 2 } }}
      />

      {news.sourceUrl && (
        <Button href={news.sourceUrl} target="_blank" startIcon={<SourceIcon />} sx={{ mt: 2 }}>
          Читать оригинал на {news.source || 'источнике'}
        </Button>
      )}
    </Box>
  );
}
