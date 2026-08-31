<template>
  <div class="news-page">
    <h1 class="page-title">Новости</h1>

    <Toolbar class="filters-toolbar">
      <template #start>
        <div class="filters-row">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Поиск новостей..."
              @input="debouncedSearch"
            />
          </IconField>

          <Dropdown
            v-model="selectedCategory"
            :options="categories"
            option-label="label"
            option-value="value"
            placeholder="Все категории"
            @change="applyFilters"
          />

          <Dropdown
            v-model="sortBy"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            placeholder="Сортировка"
            @change="applyFilters"
          />

          <DatePicker
            v-model="fromDate"
            date-format="dd.mm.yy"
            placeholder="Дата от"
            show-icon
            show-clear
            @update:model-value="applyFilters"
          />

          <DatePicker
            v-model="toDate"
            date-format="dd.mm.yy"
            placeholder="Дата до"
            show-icon
            show-clear
            :min-date="fromDate ?? undefined"
            @update:model-value="applyFilters"
          />
        </div>
      </template>

      <template v-if="hasActiveFilters" #end>
        <Button
          label="Сбросить"
          aria-label="Сбросить"
          icon="pi pi-refresh"
          severity="secondary"
          @click="resetFilters"
        />
      </template>
    </Toolbar>

    <div v-if="newsStore.isLoading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else-if="newsStore.error" class="error-container">
      <Message severity="error">{{ newsStore.error }}</Message>
    </div>

    <div v-else class="news-grid">
      <NewsCard
        v-for="item in newsStore.news"
        :key="item.id"
        :news="item"
        @click="openNewsDetail(item.id)"
      />
    </div>

    <div v-if="newsStore.news.length > 0" class="pagination-section">
      <Paginator
        :rows="20"
        :total-records="totalRecords"
        :rows-per-page-options="[10, 20, 50]"
        @page="onPageChange"
      />
    </div>

    <div v-if="!newsStore.isLoading && newsStore.news.length === 0" class="empty-state">
      <i class="pi pi-inbox icon-empty-lg"></i>
      <h3>Новости не найдены</h3>
      <p>Попробуйте изменить параметры поиска</p>
    </div>

    <NewsDetailModal
      v-if="detailModalVisible"
      v-model:visible="detailModalVisible"
      :news="selectedNews"
    />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, NewsCategory, NewsFilter } from '~/types';
import { useDebounceFn } from '@vueuse/core';
import { formatCalendarDate } from '~/utils/formatCalendarDate';

const newsStore = useNewsStore();

const searchQuery = ref('');
const selectedCategory = ref<NewsCategory | null>(null);
const sortBy = ref('publishedAt');
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const detailModalVisible = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const totalRecords = ref(100);

const categories = [
  { label: 'Политика', value: 'politics' },
  { label: 'Экономика', value: 'economy' },
  { label: 'Технологии', value: 'technology' },
  { label: 'Наука', value: 'science' },
  { label: 'Спорт', value: 'sports' },
  { label: 'Развлечения', value: 'entertainment' },
  { label: 'Здоровье', value: 'health' },
  { label: 'Мир', value: 'world' },
  { label: 'Другое', value: 'other' },
];

const sortOptions = [
  { label: 'Сначала новые', value: 'publishedAt' },
  { label: 'Сначала старые', value: 'publishedAt_asc' },
  { label: 'По просмотрам', value: 'views' },
  { label: 'По лайкам', value: 'likes' },
];

await useAsyncData('news-page-data', async () => {
  await newsStore.fetchNews();
  return {
    newsCount: newsStore.news.length,
    total: newsStore.news.length,
  };
});

const debouncedSearch = useDebounceFn(() => {
  applyFilters();
}, 500);

const hasActiveFilters = computed(
  () =>
    !!searchQuery.value ||
    !!selectedCategory.value ||
    !!fromDate.value ||
    !!toDate.value ||
    sortBy.value !== 'publishedAt',
);

function applyFilters(): void {
  const filter: NewsFilter = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    fromDate: undefined,
    toDate: undefined,
  };

  if (sortBy.value) {
    const [field, order] = sortBy.value.split('_');
    filter.sortBy = field as NewsFilter['sortBy'];
    filter.sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  }

  if (fromDate.value) {
    filter.fromDate = formatCalendarDate(fromDate.value);
  }

  if (toDate.value) {
    filter.toDate = formatCalendarDate(toDate.value);
  }

  newsStore.setFilter({ ...filter, page: 1 });
  newsStore.fetchNews();
}

function resetFilters(): void {
  searchQuery.value = '';
  selectedCategory.value = null;
  sortBy.value = 'publishedAt';
  fromDate.value = null;
  toDate.value = null;
  newsStore.resetFilter();
  newsStore.fetchNews();
}

interface PageEvent {
  page: number;
  rows: number;
}

function onPageChange(event: PageEvent): void {
  newsStore.setFilter({
    page: event.page + 1,
    limit: event.rows,
  });
  newsStore.fetchNews();
}

function openNewsDetail(id: string): void {
  selectedNews.value = newsStore.news.find((n: NewsItem) => n.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}
</script>

<style scoped>
.news-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin-bottom: 2rem;
}

.filters-toolbar {
  margin-bottom: 2rem;
  border-radius: 6px;
}

.filters-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.filters-row > * {
  min-width: 200px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--p-text-muted-color);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .filters-row {
    flex-direction: column;
    width: 100%;
  }

  .filters-row > * {
    width: 100%;
    min-width: unset;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
