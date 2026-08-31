'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
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
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { News } from '@/types';
import NewsDetail from '@/components/NewsDetail';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNews, setCurrentNews } from '@/store/news/newsSlice';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { truncateText } from '@/utils/truncateText';
import NewsDateRangePicker from '@/components/NewsDateRangePicker';

const PAGE_SIZE = 20;

export default function NewsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { news, isLoading, isLoadingMore, hasMore, currentNews } = useAppSelector((s) => s.news);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [aiFilter, setAiFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const buildParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string | number> = {
        page: pageNum,
        limit: PAGE_SIZE,
        sortBy,
      };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      if (aiFilter !== 'all') params.isAiGenerated = aiFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      return params;
    },
    [category, sortBy, aiFilter, search, fromDate, toDate],
  );

  const loadNews = useCallback(
    (pageNum: number, append: boolean) => {
      dispatch(fetchNews({ params: buildParams(pageNum), append }));
    },
    [buildParams, dispatch],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    setPage(1);
    loadNews(1, false);
  }, [category, sortBy, aiFilter, fromDate, toDate, loadNews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadNews(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page, loadNews]);

  const handleSearch = () => {
    setPage(1);
    loadNews(1, false);
  };

  const openNews = (item: News) => {
    dispatch(setCurrentNews(item));
  };

  const closeNews = () => {
    dispatch(setCurrentNews(null));
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
    <Container sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 }, maxWidth: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
        📰 Лента новостей
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <TextField
          size="small"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: { startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> },
          }}
          sx={{ minWidth: isMobile ? '100%' : 200, flex: isMobile ? '1 1 100%' : '1 1 180px' }}
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
          }}
          sx={{ minWidth: isMobile ? '100%' : 160, flex: isMobile ? '1 1 100%' : '1 1 140px' }}
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
          }}
          sx={{ minWidth: isMobile ? '100%' : 160, flex: isMobile ? '1 1 100%' : '1 1 150px' }}
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
          }}
          sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : '1 1 140px' }}
        >
          <MenuItem value="all">📋 Все</MenuItem>
          <MenuItem value="true">🤖 AI-рерайт</MenuItem>
          <MenuItem value="false">📄 Оригиналы</MenuItem>
        </TextField>
        <NewsDateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          fullWidth={isMobile}
          onChange={(from, to) => {
            setFromDate(from);
            setToDate(to);
          }}
        />
        {(category !== 'all' || aiFilter !== 'all' || search || fromDate || toDate) && (
          <Button
            size="small"
            onClick={() => {
              setCategory('all');
              setAiFilter('all');
              setSearch('');
              setFromDate('');
              setToDate('');
            }}
          >
            Сбросить
          </Button>
        )}
      </Box>

      <Grid container spacing={1.5}>
        {isLoading
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
                  <CardActionArea onClick={() => openNews(item)}>
                    <CardContent
                      sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          wordBreak: 'break-word',
                        }}
                      >
                        {truncateText(item.summary, 150)}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}
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
                          👁 {item.views} · ❤️ {item.likes} ·{' '}
                          {new Date(item.publishedAt ?? item.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      <div ref={loaderRef} style={{ textAlign: 'center', padding: '24px 0' }}>
        {isLoadingMore && <Skeleton variant="text" width={200} sx={{ mx: 'auto' }} />}
        {!hasMore && news.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Все новости загружены
          </Typography>
        )}
      </div>

      <Dialog
        open={!!currentNews}
        onClose={closeNews}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <IconButton onClick={closeNews} sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>{currentNews && <NewsDetail />}</DialogContent>
      </Dialog>
    </Container>
  );
}
