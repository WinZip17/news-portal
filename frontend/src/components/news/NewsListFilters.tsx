import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Input, Select, Button, DatePicker } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { NewsCategory } from '@/types';
import { useNews } from '@/hooks/useNews.ts';
import styles from './NewsListFilters.module.css';

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
    <div className={styles.root}>
      <Input.Search
        className={styles.search}
        placeholder="Поиск..."
        allowClear
        defaultValue={filters.search || ''}
        prefix={<SearchOutlined />}
        onSearch={setSearch}
        onChange={(e) => {
          if (!e.target.value) setSearch('');
        }}
      />

      <div className={styles.grid}>
        <div className={styles.field}>
          <strong className={styles.label}>Категория:</strong>
          <Select value={filters.category || 'all'} onChange={setCategory} options={categoryOptions} />
        </div>

        <div className={styles.field}>
          <strong className={styles.label}>Сортировка:</strong>
          <Select value={filters.sortBy || 'publishedAt'} onChange={setSortBy} options={sortOptions} />
        </div>

        <div className={styles.field}>
          <strong className={styles.label}>Тип новости:</strong>
          <Select
            value={filters.isAiGenerated === undefined ? 'all' : filters.isAiGenerated ? 'true' : 'false'}
            onChange={setAiFilter}
            options={aiFilterOptions}
          />
        </div>

        <div className={styles.field}>
          <strong className={styles.label}>Дата новостей</strong>
          <RangePicker
            format="DD.MM.YYYY"
            value={[filters?.fromDate ? dayjs(filters?.fromDate) : null, filters?.toDate ? dayjs(filters?.toDate) : null]}
            onChange={setDate}
            allowEmpty={[true, true]}
          />
        </div>

        {hasActiveFilters && (
          <div className={`${styles.field} ${styles.actions}`}>
            <Button icon={<ClearOutlined />} onClick={clearAllFilters} block>
              Сбросить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsListFilters;
