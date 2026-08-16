'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as SmartSearchIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { newsService } from '@/services/newsService';
import { News } from '@/types';
import NewsDetail from '@/components/NewsDetail';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { formatAppliedFilters } from '@/utils/formatAppliedFilters';
import { truncateText } from '@/utils/truncateText';

const PAGE_SIZE = 20;

const EXAMPLE_QUERIES = [
  'AI новости про технологии за неделю',
  'экономика и инфляция',
  'популярные новости про спорт',
];

export default function SmartSearchPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchHint, setSearchHint] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'ai' | 'fallback' | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const applyResponse = useCallback(
    (
      data: Awaited<ReturnType<typeof newsService.smartSearch>>,
      pageNum: number,
      append: boolean,
    ) => {
      if (append) {
        setNews((prev) => [...prev, ...data.data]);
      } else {
        setNews(data.data);
      }
      setHasMore(pageNum * PAGE_SIZE < data.total);
      setSearchHint(formatAppliedFilters(data.appliedFilters));
      setSearchSource(data.source);
    },
    [],
  );

  const runSearch = useCallback(
    async (searchQuery: string, pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await newsService.smartSearch(searchQuery, pageNum, PAGE_SIZE);
        applyResponse(data, pageNum, append);
      } catch {
        if (!append) {
          setNews([]);
          setHasMore(false);
          setSearchHint(null);
          setSearchSource(null);
        }
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [applyResponse],
  );

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setActiveQuery(trimmed);
    setPage(1);
    setHasMore(true);
    runSearch(trimmed, 1, false);
  };

  useEffect(() => {
    if (!activeQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          runSearch(activeQuery, nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [activeQuery, hasMore, loading, loadingMore, page, runSearch]);

  return (
    <Container sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 }, maxWidth: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
        🧠 Умный поиск
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Опишите запрос своими словами — AI подберёт фильтры, а поиск выполнится по заголовку,
        описанию и тегам.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          fullWidth={isMobile}
          multiline={!isMobile}
          minRows={isMobile ? 1 : 2}
          size="small"
          placeholder="Например: AI новости про технологии за последнюю неделю"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
          sx={{ flex: 1, minWidth: isMobile ? '100%' : 320 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          startIcon={<SmartSearchIcon />}
        >
          Найти
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {EXAMPLE_QUERIES.map((example) => (
          <Chip
            key={example}
            label={example}
            variant="outlined"
            onClick={() => {
              setQuery(example);
            }}
          />
        ))}
      </Box>

      {searchHint && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Распознано{searchSource === 'fallback' ? ' (без AI)' : ''}: {searchHint}
        </Typography>
      )}

      {!activeQuery && !loading && (
        <Typography variant="body2" color="text.secondary">
          Введите запрос и нажмите «Найти».
        </Typography>
      )}

      <Grid container spacing={1.5} sx={{ mt: 1 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
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

      {activeQuery && !loading && news.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          По запросу «{activeQuery}» ничего не найдено.
        </Typography>
      )}

      <div ref={loaderRef} style={{ textAlign: 'center', padding: '24px 0' }}>
        {loadingMore && <Skeleton variant="text" width={200} sx={{ mx: 'auto' }} />}
        {!hasMore && news.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Все результаты загружены
          </Typography>
        )}
      </div>

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
    </Container>
  );
}
