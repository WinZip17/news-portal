'use client';
import React, { useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Box,
  Button,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  Article as ArticleIcon,
  Group as GroupIcon,
  SmartToy as AIIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import NewsDetail from '@/components/NewsDetail';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchStats } from '@/store/news/newsSlice';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { truncateText } from '@/utils/truncateText';

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedNews, setSelectedNews] = React.useState<News | null>(null);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const stats = useAppSelector((s) => s.news.stats);
  const statsLoading = useAppSelector((s) => s.news.statsLoading);

  useEffect(() => {
    newsService.getNews({ limit: 6 }).then((res) => {
      setNews(res.data);
      setLoading(false);
    });
    dispatch(fetchStats());
  }, []);

  return (
    <Box sx={{ maxWidth: '100%', minWidth: 0, px: { xs: 1, sm: 2 } }}>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 4 },
          textAlign: 'center',
          color: 'white',
          borderRadius: 4,
          mb: { xs: 4, md: 6 },
        }}
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
          gutterBottom
        >
          📰 Short News
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            opacity: 0.9,
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
          }}
        >
          Актуальные новости с AI-рерайтом из проверенных источников.
        </Typography>
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              startIcon={<RocketIcon />}
              color="info"
              aria-label="Читать новости"
              onClick={() => router.push('/news')}
            >
              Начать бесплатно
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? 'medium' : 'large'}
              sx={{ color: 'white', borderColor: 'white', whiteSpace: 'nowrap' }}
              onClick={() => router.push('/login')}
              aria-label="Войти"
            >
              Войти
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<ArticleIcon />}
            sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}
            onClick={() => router.push('/news')}
            aria-label="Читать новости"
          >
            Читать новости
          </Button>
        )}
      </Box>

      {/* Статистика */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
        {[
          { icon: <ArticleIcon />, label: 'Сегодня', value: stats.newsToday },
          { icon: <GroupIcon />, label: 'Пользователей', value: stats.totalUsers },
          { icon: <AIIcon />, label: 'AI-рерайт', value: stats.totalAiNews },
          { icon: <ArticleIcon />, label: 'Всего', value: stats.totalNews },
          { icon: <VisibilityIcon />, label: 'Просмотров', value: stats.totalViews },
          { icon: <PendingIcon />, label: 'На модерации', value: stats.pendingNews },
        ].map((stat, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1, sm: 2 },
                  '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 0.5, fontSize: { xs: 22, sm: 28 } }}>
                  {stat.icon}
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', mx: 'auto', width: '50%' }} />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.5rem' } }}
                  >
                    {stat.value}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    whiteSpace: 'normal',
                    lineHeight: 1.3,
                    minHeight: '2.6em',
                  }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Последние новости */}
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
        Последние новости
      </Typography>
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : news.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea
                    onClick={() => setSelectedNews(item)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height={isMobile ? 120 : 160}
                        image={item.imageUrl}
                        alt={item.title}
                      />
                    )}
                    <CardContent
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component="p"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          wordBreak: 'break-word',
                        }}
                        gutterBottom
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          wordBreak: 'break-word',
                        }}
                      >
                        {truncateText(item.summary, 100)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          mt: 'auto',
                        }}
                      >
                        <Chip
                          label={getCategoryLabel(item.category)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {item.isAiGenerated && (
                          <Chip icon={<AIIcon />} label="AI" size="small" color="secondary" />
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                        >
                          {new Date(item.publishedAt ?? item.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Модалка новости */}
      <Dialog
        open={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <IconButton
          onClick={() => setSelectedNews(null)}
          sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedNews && <NewsDetail news={selectedNews} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
