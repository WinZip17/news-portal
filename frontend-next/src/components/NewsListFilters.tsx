'use client';

import { useMemo, useState } from 'react';
import { Badge, Box, Button, MenuItem, Popover, TextField, Typography } from '@mui/material';
import {
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import NewsDateRangePicker from '@/components/NewsDateRangePicker';

export type NewsListFiltersProps = {
  search: string;
  category: string;
  sortBy: string;
  aiFilter: string;
  fromDate: string;
  toDate: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onCategoryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onAiFilterChange: (value: string) => void;
  onDateChange: (from: string, to: string) => void;
  onReset: () => void;
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

export default function NewsListFilters({
  search,
  category,
  sortBy,
  aiFilter,
  fromDate,
  toDate,
  hasActiveFilters,
  onSearchChange,
  onSearch,
  onCategoryChange,
  onSortByChange,
  onAiFilterChange,
  onDateChange,
  onReset,
}: NewsListFiltersProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const filtersOpen = Boolean(anchorEl);

  const secondaryFilterCount = useMemo(
    () => [category !== 'all', aiFilter !== 'all', fromDate, toDate].filter(Boolean).length,
    [category, aiFilter, fromDate, toDate],
  );

  return (
    <Box sx={{ mb: 3, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 1.5,
          width: '100%',
        }}
      >
        <TextField
          size="small"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          slotProps={{
            input: { startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> },
          }}
          sx={{
            width: '100%',
            flex: { md: '1 1 auto' },
            minWidth: 0,
          }}
        />

        <TextField
          select
          size="small"
          aria-label="Сортировка"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          sx={{
            width: { xs: '100%', md: 180 },
            flexShrink: 0,
          }}
        >
          <MenuItem value="publishedAt">🕒 По дате</MenuItem>
          <MenuItem value="views">👁 По просмотрам</MenuItem>
          <MenuItem value="likes">❤️ По лайкам</MenuItem>
        </TextField>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            width: { xs: '100%', md: 'auto' },
            flexShrink: 0,
            '& .MuiButton-root': {
              flex: { xs: '1 1 auto', md: '0 0 auto' },
            },
          }}
        >
          <Badge badgeContent={secondaryFilterCount} color="primary">
            <Button
              variant={secondaryFilterCount > 0 ? 'contained' : 'outlined'}
              size="small"
              startIcon={<FilterListIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Фильтры
            </Button>
          </Badge>

          {hasActiveFilters && (
            <Button size="small" startIcon={<ClearIcon />} onClick={onReset}>
              Сбросить
            </Button>
          )}
        </Box>
      </Box>

      <Popover
        open={filtersOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { p: 2, width: 'min(320px, calc(100vw - 32px))' },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Категория
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Тип новости
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={aiFilter}
              onChange={(e) => onAiFilterChange(e.target.value)}
            >
              <MenuItem value="all">📋 Все</MenuItem>
              <MenuItem value="true">🤖 AI-рерайт</MenuItem>
              <MenuItem value="false">📄 Оригиналы</MenuItem>
            </TextField>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Дата новостей
            </Typography>
            <NewsDateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              stacked
              fullWidth
              onChange={onDateChange}
            />
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
