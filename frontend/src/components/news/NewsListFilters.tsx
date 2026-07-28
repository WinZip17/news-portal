import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { NewsCategory } from '@/types';
import { useNews } from '@/hooks/useNews.ts';

type NewsListFiltersTypes = {
  hasActiveFilters: boolean;
};

const NewsListFilters: React.FC<NewsListFiltersTypes> = ({ hasActiveFilters }) => {
  const { filters, setSearch, setCategory, setSortBy, setAiFilter, clearAllFilters } = useNews();

  const sortOptions = [
    {
      label: '🕒 По дате',
      value: 'publishedAt',
    },
    {
      label: '👁 По просмотрам',
      value: 'views',
    },
    {
      label: '❤️ По лайкам',
      value: 'likes',
    },
  ];
  const categoryOptions = [
    { label: '📂 Все', value: 'all' },
    { label: '🏛 Политика', value: NewsCategory.POLITICS },
    { label: '💹 Экономика', value: NewsCategory.ECONOMY },
    { label: '💻 Технологии', value: NewsCategory.TECHNOLOGY },
    { label: '🔬 Наука', value: NewsCategory.SCIENCE },
    { label: '⚽ Спорт', value: NewsCategory.SPORTS },
    { label: '🎬 Развлечения', value: NewsCategory.ENTERTAINMENT },
    { label: '🏥 Здоровье', value: NewsCategory.HEALTH },
    { label: '🌍 Мир', value: NewsCategory.WORLD },
  ];

  const aiFilterOptions = [
    { label: '📋 Все', value: 'all' },
    { label: '🤖 AI-рерайт', value: 'true' },
    { label: '📄 Оригиналы', value: 'false' },
  ];
  return (
    <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
      <Input.Search
        placeholder="Поиск..."
        allowClear
        defaultValue={filters.search || ''}
        style={{ minWidth: 200 }}
        prefix={<SearchOutlined />}
        onSearch={setSearch}
        onChange={(e) => {
          if (!e.target.value) setSearch('');
        }}
      />
      <Select value={filters.category || 'all'} style={{ minWidth: 160 }} onChange={setCategory} options={categoryOptions} />
      <Select value={filters.sortBy || 'publishedAt'} style={{ minWidth: 140 }} onChange={setSortBy} options={sortOptions} />
      <Select
        value={filters.isAiGenerated === undefined ? 'all' : filters.isAiGenerated ? 'true' : 'false'}
        style={{ minWidth: 150 }}
        onChange={setAiFilter}
        options={aiFilterOptions}
      />
      {hasActiveFilters && (
        <Button icon={<ClearOutlined />} onClick={clearAllFilters} size="small">
          Сбросить
        </Button>
      )}
    </Space>
  );
};

export default NewsListFilters;
