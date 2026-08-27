import { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store';
import {
  checkNewsInteraction,
  fetchNewsById,
  toggleFavorite,
  toggleLike,
} from '@/store/news/newsSlice';
import { getCategoryLabel } from '@/utils/getCategoryLabel';

export default function NewsDetail() {
  const dispatch = useAppDispatch();
  const currentNews = useAppSelector((s) => s.news.currentNews);
  const currentNewsLoading = useAppSelector((s) => s.news.currentNewsLoading);
  const isLiked = useAppSelector((s) => s.news.isLiked);
  const isFavorited = useAppSelector((s) => s.news.isFavorited);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (!currentNews?.id) return;

    dispatch(fetchNewsById(currentNews.id));
    dispatch(checkNewsInteraction(currentNews.id));
  }, [currentNews?.id, dispatch]);

  const handleLike = async () => {
    if (!currentNews) return;

    if (!isAuthenticated) {
      setSnackbar('Войдите, чтобы ставить лайки');
      return;
    }

    dispatch(toggleLike(currentNews.id));
  };

  const handleFavorite = async () => {
    if (!currentNews) return;

    if (!isAuthenticated) {
      setSnackbar('Войдите, чтобы добавлять в избранное');
      return;
    }

    dispatch(toggleFavorite(currentNews.id));
  };

  const handleShare = async () => {
    if (!currentNews) return;

    const url = `${window.location.origin}/?news=${currentNews.id}`;
    try {
      await navigator.share({
        title: currentNews.title,
        text: currentNews.summary,
        url,
      });
    } catch {
      await navigator.clipboard.writeText(url);
      setSnackbar('Ссылка скопирована');
    }
  };

  if (!currentNews || currentNewsLoading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  return (
    <Box>
      <Alert severity={currentNews.isAiGenerated ? 'info' : 'success'} sx={{ mb: 2 }}>
        {currentNews.isAiGenerated ? '🤖 AI-рерайт новости' : '📄 Оригинальная новость'}
      </Alert>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
      <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
        {currentNews.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
        <Typography variant="body2">
          📅{' '}
          {new Date(currentNews.publishedAt ?? currentNews.createdAt).toLocaleDateString('ru-RU')}
        </Typography>
        <Typography variant="body2">👁 {currentNews.views} просмотров</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          size="small"
          startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
          onClick={handleLike}
          color={isLiked ? 'primary' : 'inherit'}
        >
          {currentNews.likes}
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
        <Chip label={getCategoryLabel(currentNews.category)} size="small" color="primary" />
        {currentNews.isAiGenerated && (
          <Chip icon={<AIIcon />} label="AI-рерайт" size="small" color="secondary" />
        )}
        {currentNews.source && (
          <Chip icon={<SourceIcon />} label={currentNews.source} size="small" variant="outlined" />
        )}
        {currentNews.tags?.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {currentNews.imageUrl && (
        <Box
          component="img"
          src={currentNews.imageUrl}
          alt={currentNews.title}
          sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, mb: 2 }}
        />
      )}

      {currentNews.summary && (
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          {currentNews.summary}
        </Typography>
      )}

      <Box
        dangerouslySetInnerHTML={{ __html: currentNews.content }}
        sx={{ '& p': { mb: 1.5, lineHeight: 1.8 }, '& img': { maxWidth: '100%', borderRadius: 2 } }}
      />

      {currentNews.sourceUrl && (
        <Button
          href={currentNews.sourceUrl}
          target="_blank"
          startIcon={<SourceIcon />}
          sx={{ mt: 2 }}
        >
          Читать оригинал на {currentNews.source || 'источнике'}
        </Button>
      )}
    </Box>
  );
}
