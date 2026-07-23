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
} from '@mui/material';
import {
  Rocket as RocketIcon,
  Article as ArticleIcon,
  Group as GroupIcon,
  SmartToy as AIIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import NewsDetail from '@/components/NewsDetail';
import { useAppSelector } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedNews, setSelectedNews] = React.useState<News | null>(null);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    newsService.getNews({ limit: 6 }).then((res) => {
      setNews(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 8,
          textAlign: 'center',
          color: 'white',
          borderRadius: 4,
          mb: 6,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
          📰 News Portal
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Актуальные новости с AI-рерайтом из проверенных источников.
        </Typography>
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketIcon />}
              sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}
              onClick={() => router.push('/register')}
            >
              Начать бесплатно
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => router.push('/login')}
            >
              Войти
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={<ArticleIcon />}
            sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f0f0f0' } }}
            onClick={() => router.push('/news')}
          >
            Читать новости
          </Button>
        )}
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { icon: <ArticleIcon />, label: 'Новостей сегодня', value: news.length },
          { icon: <GroupIcon />, label: 'Пользователей', value: 1523 },
          { icon: <AIIcon />, label: 'AI-рерайт', value: 856 },
        ].map((stat, i) => (
          <Grid size={{ xs: 12, sm: 4 }} key={i}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loading ? <Skeleton /> : stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Последние новости */}
      <Typography variant="h4" gutterBottom>
        Последние новости
      </Typography>
      <Grid container spacing={3}>
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
                <Card>
                  <CardActionArea onClick={() => setSelectedNews(item)}>
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={item.imageUrl}
                        alt={item.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {item.summary?.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={item.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {item.isAiGenerated && (
                          <Chip icon={<AIIcon />} label="AI" size="small" color="secondary" />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Модалка новости */}
      <Dialog open={!!selectedNews} onClose={() => setSelectedNews(null)} maxWidth="md" fullWidth>
        <IconButton
          onClick={() => setSelectedNews(null)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 3 }}>
          {selectedNews && <NewsDetail news={selectedNews} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
