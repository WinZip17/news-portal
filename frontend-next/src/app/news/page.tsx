'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Box,
  TextField,
  MenuItem,
  Pagination,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  Button,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import NewsDetail from '@/components/NewsDetail';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [aiFilter, setAiFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    loadNews();
  }, [category, sortBy, aiFilter, page]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, sortBy };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      if (aiFilter !== 'all') params.isAiGenerated = aiFilter;
      const data = await newsService.getNews(params);
      setNews(data.data);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadNews();
  };

  const categories = [
    { value: 'all', label: '📂 Все' },
    { value: 'politics', label: '🏛 Политика' },
    { value: 'economy', label: '💹 Экономика' },
    { value: 'technology', label: '💻 Технологии' },
    { value: 'science', label: '🔬 Наука' },
    { value: 'sports', label: '⚽ Спорт' },
    { value: 'entertainment', label: '🎬 Развлечения' },
    { value: 'health', label: '🏥 Здоровье' },
    { value: 'world', label: '🌍 Мир' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📰 Лента новостей
      </Typography>

      {/* Фильтры */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <TextField
          size="small"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: { startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> },
          }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        >
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="publishedAt">🕒 По дате</MenuItem>
          <MenuItem value="views">👁 По просмотрам</MenuItem>
          <MenuItem value="likes">❤️ По лайкам</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          value={aiFilter}
          onChange={(e) => {
            setAiFilter(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">📋 Все</MenuItem>
          <MenuItem value="true">🤖 AI-рерайт</MenuItem>
          <MenuItem value="false">📄 Оригиналы</MenuItem>
        </TextField>
        {(category !== 'all' || aiFilter !== 'all' || search) && (
          <Button
            size="small"
            onClick={() => {
              setCategory('all');
              setAiFilter('all');
              setSearch('');
              setPage(1);
            }}
          >
            Сбросить
          </Button>
        )}
      </Box>

      {/* Список новостей */}
      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : news.map((item) => (
              <Grid size={{ xs: 12 }} key={item.id}>
                <Card>
                  <CardActionArea onClick={() => setSelectedNews(item)}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.summary?.substring(0, 150)}...
                      </Typography>
                      <Box
                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}
                      >
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
                          👁 {item.views} · ❤️ {item.likes} ·{' '}
                          {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {total > 12 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={Math.ceil(total / 12)} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

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
    </Container>
  );
}
