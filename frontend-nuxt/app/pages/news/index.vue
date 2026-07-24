<template>
  <div class="news-page">
    <h1 class="page-title">Новости</h1>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filters-grid">
        <!-- Поиск -->
        <div class="filter-item">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Поиск новостей..."
              class="w-full"
              @input="debouncedSearch"
            />
          </span>
        </div>

        <!-- Категория -->
        <div class="filter-item">
          <Dropdown
            v-model="selectedCategory"
            :options="categories"
            option-label="label"
            option-value="value"
            placeholder="Все категории"
            class="w-full"
            @change="applyFilters"
          />
        </div>

        <!-- Сортировка -->
        <div class="filter-item">
          <Dropdown
            v-model="sortBy"
            :options="sortOptions"
            option-label="label"
            option-value="value"
            placeholder="Сортировка"
            class="w-full"
            @change="applyFilters"
          />
        </div>

        <!-- Сброс -->
        <div class="filter-item">
          <Button
            label="Сбросить"
            icon="pi pi-refresh"
            severity="secondary"
            class="w-full"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <!-- Сетка новостей -->
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
        @favorite="handleFavorite"
      />
    </div>

    <!-- Пагинация -->
    <div v-if="newsStore.news.length > 0" class="pagination-section">
      <Paginator
        :rows="20"
        :total-records="totalRecords"
        :rows-per-page-options="[10, 20, 50]"
        @page="onPageChange"
      />
    </div>

    <!-- Пустое состояние -->
    <div v-if="!newsStore.isLoading && newsStore.news.length === 0" class="empty-state">
      <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-color-disabled)"></i>
      <h3>Новости не найдены</h3>
      <p>Попробуйте изменить параметры поиска</p>
    </div>

    <!-- Модальное окно -->
    <NewsDetailModal
      v-model:visible="detailModalVisible"
      :news="selectedNews"
      @like="handleLike"
      @favorite="handleFavorite"
    />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, NewsCategory } from '@/app/types';
import NewsCard from '@/app/components/news/NewsCard.vue';
import NewsDetailModal from '@/app/components/news/NewsDetailModal.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import { useDebounceFn } from '@vueuse/core';

const newsStore = useNewsStore();

const searchQuery = ref('');
const selectedCategory = ref<NewsCategory | null>(null);
const sortBy = ref('publishedAt');
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

// Загрузка данных
await useAsyncData('news-list', () => {
  return newsStore.fetchNews();
});

const debouncedSearch = useDebounceFn(() => {
  applyFilters();
}, 500);

function applyFilters() {
  const filter: any = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
  };

  // Парсим сортировку
  if (sortBy.value) {
    const [field, order] = sortBy.value.split('_');
    filter.sortBy = field;
    filter.sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  }

  newsStore.setFilter(filter);
  newsStore.fetchNews();
}

function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = null;
  sortBy.value = 'publishedAt';
  newsStore.resetFilter();
  newsStore.fetchNews();
}

function onPageChange(event: any) {
  newsStore.setFilter({
    page: event.page + 1,
    limit: event.rows,
  });
  newsStore.fetchNews();
}

function openNewsDetail(id: string) {
  selectedNews.value = newsStore.news.find((n) => n.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}

function handleLike(id: string) {
  // Уже обработано в сторе
}

function handleFavorite(id: string) {
  // Уже обработано в сторе
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
  color: var(--text-color);
  margin-bottom: 2rem;
}

.filters-section {
  background-color: var(--surface-card);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  border: 1px solid var(--surface-border);
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
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
  color: var(--text-color-disabled);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
