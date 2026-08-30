import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Input, Select, Space, Button, DatePicker } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { NewsCategory } from '@/types';
import { useNews } from '@/hooks/useNews.ts';

const { RangePicker } = DatePicker;

type NewsListFiltersTypes = {
  hasActiveFilters: boolean;
};

const NewsListFilters: React.FC<NewsListFiltersTypes> = ({ hasActiveFilters }) => {
  const { filters, setSearch, setCategory, setSortBy, setAiFilter, clearAllFilters, setDateFilter } = useNews();

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

  const setDate = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const [fromEvent, toEvent] = dates ?? [null, null];
    const from = fromEvent?.format('YYYY-MM-DD');
    const to = toEvent?.format('YYYY-MM-DD');
    setDateFilter({
      to,
      from,
    });
  };

  return (
    <>
      <Input.Search
        placeholder="Поиск..."
        allowClear
        defaultValue={filters.search || ''}
        prefix={<SearchOutlined />}
        onSearch={setSearch}
        style={{ width: '100%', marginBottom: 16 }}
        onChange={(e) => {
          if (!e.target.value) setSearch('');
        }}
      />
      <Space wrap size="middle" align="end" style={{ width: '100%', marginBottom: 16 }}>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Категория:</strong>
          <Select value={filters.category || 'all'} style={{ minWidth: 160 }} onChange={setCategory} options={categoryOptions} />
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Сортировка:</strong>
          <Select value={filters.sortBy || 'publishedAt'} style={{ minWidth: 180 }} onChange={setSortBy} options={sortOptions} />
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Тип новости:</strong>
          <Select
            value={filters.isAiGenerated === undefined ? 'all' : filters.isAiGenerated ? 'true' : 'false'}
            style={{ minWidth: 150 }}
            onChange={setAiFilter}
            options={aiFilterOptions}
          />
        </div>

        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Дата</strong>
          <RangePicker
            format="DD.MM.YYYY"
            defaultValue={[filters?.fromDate ? dayjs(filters?.fromDate) : null, filters?.toDate ? dayjs(filters?.toDate) : null]}
            onChange={setDate}
            allowEmpty={[true, true]}
          />
        </div>
        {hasActiveFilters && (
          <Button icon={<ClearOutlined />} onClick={clearAllFilters}>
            Сбросить
          </Button>
        )}
      </Space>
    </>
  );
};

export default NewsListFilters;
