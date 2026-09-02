<template>
  <Card class="news-list-card" :pt="cardStyles" @click="emit('click', news.id)">
    <template #content>
      <h3 class="news-list-title">{{ news.title }}</h3>
      <p v-if="summary" class="news-list-summary">{{ summary }}</p>

      <div class="news-list-meta">
        <span class="category-badge">{{ categoryLabel }}</span>
        <span v-if="news.isAiGenerated" class="type-badge type-badge--ai">
          <i class="pi pi-sparkles"></i>
          AI
        </span>
        <span v-else class="type-badge type-badge--original">
          <i class="pi pi-link"></i>
          Оригинал
        </span>
        <span class="meta-stats">
          <span><i class="pi pi-eye"></i> {{ news.views }}</span>
          <span><i class="pi pi-heart"></i> {{ news.likes }}</span>
          <span>{{ formattedDate }}</span>
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types';

const props = defineProps<{
  news: NewsItem;
}>();

const emit = defineEmits<{
  click: [id: string];
}>();

const { getCategoryLabel, truncateText, formatDate } = useUtils();

const categoryLabel = computed(() => getCategoryLabel(props.news.category));

const summary = computed(() =>
  truncateText(props.news.summary || props.news.content || '', 150),
);

const formattedDate = computed(() =>
  formatDate(props.news.publishedAt || props.news.createdAt, 'short'),
);

const cardStyles = {
  content: {
    class: 'news-list-card-content',
  },
};
</script>

<style scoped>
.news-list-card {
  width: 100%;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background-color: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
}

.news-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.news-list-card :deep(.news-list-card-content) {
  padding: 1rem;
}

.news-list-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  word-break: break-word;
}

.news-list-summary {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.news-list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.category-badge {
  background-color: var(--p-primary-color);
  color: #fff;
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--p-surface-border);
}

.type-badge--ai {
  color: var(--p-primary-color);
  background-color: color-mix(in srgb, var(--p-primary-color) 10%, var(--p-surface-card));
}

.type-badge--original {
  color: #16a34a;
  background-color: color-mix(in srgb, #16a34a 10%, var(--p-surface-card));
}

.meta-stats {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-left: auto;
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
}

.meta-stats i {
  margin-right: 0.125rem;
}

@media (max-width: 768px) {
  .news-list-card :deep(.news-list-card-content) {
    padding: 0.875rem;
  }

  .news-list-title {
    font-size: 0.9375rem;
  }

  .meta-stats {
    width: 100%;
    margin-left: 0;
  }
}
</style>
