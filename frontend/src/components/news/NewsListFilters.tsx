import React, { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Input, Select, Button, DatePicker, Popover, Badge } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { NewsCategory } from '@/types';
import { useNews } from '@/hooks/useNews.ts';
import styles from './NewsListFilters.module.css';

const { RangePicker } = DatePicker;

type NewsListFiltersTypes = {
  hasActiveFilters: boolean;
};

const popupContainer = (node: HTMLElement) => node.parentElement ?? document.body;

const NewsListFilters: React.FC<NewsListFiltersTypes> = ({ hasActiveFilters }) => {
  const { filters, setSearch, setCategory, setSortBy, setAiFilter, clearAllFilters, setDateFilter } = useNews();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortOptions = [
    { label: '🕒 По дате', value: 'publishedAt' },
    { label: '👁 По просмотрам', value: 'views' },
    { label: '❤️ По лайкам', value: 'likes' },
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

  const secondaryFilterCount = useMemo(
    () => [filters.category, filters.isAiGenerated !== undefined, filters.fromDate, filters.toDate].filter(Boolean).length,
    [filters.category, filters.fromDate, filters.isAiGenerated, filters.toDate],
  );

  const setDate = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const [fromEvent, toEvent] = dates ?? [null, null];
    setDateFilter({
      from: fromEvent?.format('YYYY-MM-DD'),
      to: toEvent?.format('YYYY-MM-DD'),
    });
  };

  const filtersPanel = (
    <div className={styles.popoverPanel}>
      <div className={styles.field}>
        <strong className={styles.label}>Категория</strong>
        <Select value={filters.category || 'all'} onChange={setCategory} options={categoryOptions} getPopupContainer={popupContainer} />
      </div>

      <div className={styles.field}>
        <strong className={styles.label}>Тип новости</strong>
        <Select
          value={filters.isAiGenerated === undefined ? 'all' : filters.isAiGenerated ? 'true' : 'false'}
          onChange={setAiFilter}
          options={aiFilterOptions}
          getPopupContainer={popupContainer}
        />
      </div>

      <div className={styles.field}>
        <strong className={styles.label}>Дата новостей</strong>
        <RangePicker
          format="DD.MM.YYYY"
          value={[filters.fromDate ? dayjs(filters.fromDate) : null, filters.toDate ? dayjs(filters.toDate) : null]}
          onChange={setDate}
          allowEmpty={[true, true]}
          getPopupContainer={popupContainer}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
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

        <div className={styles.sort}>
          <strong className={styles.label}>Сортировка</strong>
          <Select aria-label="Сортировка" value={filters.sortBy || 'publishedAt'} onChange={setSortBy} options={sortOptions} />
        </div>

        <div className={styles.toolbarActions}>
          <Popover
            content={filtersPanel}
            trigger="click"
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            placement="bottomRight"
            classNames={{ root: styles.filtersPopover }}
          >
            <Badge count={secondaryFilterCount} size="small" offset={[-4, 4]}>
              <Button icon={<FilterOutlined />} type={secondaryFilterCount ? 'primary' : 'default'}>
                Фильтры
              </Button>
            </Badge>
          </Popover>

          {hasActiveFilters && (
            <Button icon={<ClearOutlined />} onClick={clearAllFilters}>
              Сбросить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsListFilters;
