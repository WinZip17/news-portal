import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { NewsCategory } from '@/types';

type NewsListFiltersTypes = {
  hasActiveFilters: boolean;
  searchParams: URLSearchParams;
  handleSearch: (value: string) => void;
  handleCategoryChange: (value: string) => void;
  handleSortChange: (value: string) => void;
  handleAiFilterChange: (value: string) => void;
  handleClearFilters: () => void;
};

const NewsListFilters: React.FC<NewsListFiltersTypes> = ({
  hasActiveFilters,
  searchParams,
  handleSearch,
  handleAiFilterChange,
  handleSortChange,
  handleCategoryChange,
  handleClearFilters,
}) => {
  return (
    <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
      <Input.Search
        placeholder="Поиск..."
        allowClear
        defaultValue={searchParams.get('search') || ''}
        style={{ minWidth: 200 }}
        prefix={<SearchOutlined />}
        onSearch={handleSearch}
        onChange={(e) => {
          if (!e.target.value) handleSearch('');
        }}
      />
      <Select value={searchParams.get('category') || 'all'} style={{ minWidth: 160 }} onChange={handleCategoryChange}>
        <Select.Option value="all">📂 Все</Select.Option>
        <Select.Option value={NewsCategory.POLITICS}>🏛 Политика</Select.Option>
        <Select.Option value={NewsCategory.ECONOMY}>💹 Экономика</Select.Option>
        <Select.Option value={NewsCategory.TECHNOLOGY}>💻 Технологии</Select.Option>
        <Select.Option value={NewsCategory.SCIENCE}>🔬 Наука</Select.Option>
        <Select.Option value={NewsCategory.SPORTS}>⚽ Спорт</Select.Option>
        <Select.Option value={NewsCategory.ENTERTAINMENT}>🎬 Развлечения</Select.Option>
        <Select.Option value={NewsCategory.HEALTH}>🏥 Здоровье</Select.Option>
        <Select.Option value={NewsCategory.WORLD}>🌍 Мир</Select.Option>
      </Select>
      <Select value={searchParams.get('sortBy') || 'publishedAt'} style={{ minWidth: 140 }} onChange={handleSortChange}>
        <Select.Option value="publishedAt">🕒 По дате</Select.Option>
        <Select.Option value="views">👁 По просмотрам</Select.Option>
        <Select.Option value="likes">❤️ По лайкам</Select.Option>
      </Select>
      <Select value={searchParams.get('isAiGenerated') || 'all'} style={{ minWidth: 150 }} onChange={handleAiFilterChange}>
        <Select.Option value="all">📋 Все</Select.Option>
        <Select.Option value="true">🤖 AI-рерайт</Select.Option>
        <Select.Option value="false">📄 Оригиналы</Select.Option>
      </Select>
      {hasActiveFilters && (
        <Button icon={<ClearOutlined />} onClick={handleClearFilters} size="small">
          Сбросить
        </Button>
      )}
    </Space>
  );
};

export default NewsListFilters;
