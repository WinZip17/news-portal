<template>
  <Card class="news-card" :pt="cardStyles">
    <template #header>
      <div v-if="news.imageUrl" class="news-card-image">
        <img :src="news.imageUrl" :alt="news.title" loading="lazy" />
        <span class="news-category-badge">{{ categoryLabel }}</span>
      </div>
    </template>

    <template #content>
      <div class="news-card-content">
        <h3 class="news-title">{{ news.title }}</h3>
        <p v-if="news.summary" class="news-summary">{{ news.summary }}</p>

        <div class="news-meta">
          <div class="meta-item">
            <i class="pi pi-eye"></i>
            <span>{{ news.views }}</span>
          </div>
          <div class="meta-item">
            <i class="pi pi-heart"></i>
            <span>{{ news.likes }}</span>
          </div>
          <div v-if="news.publishedAt" class="meta-item">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(news.publishedAt) }}</span>
          </div>
        </div>

        <div v-if="news.tags?.length" class="news-tags">
          <span v-for="tag in news.tags.slice(0, 3)" :key="tag" class="tag"> #{{ tag }} </span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="news-card-footer">
        <Button
          v-tooltip.top="'В избранное'"
          :icon="news.isFavorite ? 'pi pi-star-fill' : 'pi pi-star'"
          :severity="news.isFavorite ? 'warning' : 'secondary'"
          text
          rounded
          :disabled="!authStore.isAuthenticated"
          @click.stop="handleToggleFavorite"
        />
        <Button
          label="Читать далее"
          icon="pi pi-arrow-right"
          severity="primary"
          text
          @click="openNewsDetail"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { NewsItem } from '@/app/types';
import Card from 'primevue/card';
import { useAuthStore } from '@/app/stores/auth';
import { useNewsStore } from '@/app/stores/news';

const props = defineProps<{
  news: NewsItem;
}>();

const emit = defineEmits<{
  favorite: [id: string];
  click: [id: string];
}>();

const authStore = useAuthStore();
const newsStore = useNewsStore();

const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    politics: 'Политика',
    economy: 'Экономика',
    technology: 'Технологии',
    science: 'Наука',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    health: 'Здоровье',
    world: 'Мир',
    other: 'Другое',
  };
  return labels[props.news.category] || props.news.category;
});

const cardStyles = {
  root: {
    class: 'news-card-root',
  },
  content: {
    class: 'p-0',
  },
  footer: {
    class: 'p-0',
  },
};

function openNewsDetail() {
  emit('click', props.news.id);
}

async function handleToggleFavorite() {
  if (!authStore.isAuthenticated) {
    useToast().add({
      severity: 'warn',
      summary: 'Требуется авторизация',
      detail: 'Войдите, чтобы добавлять в избранное',
      life: 3000,
    });
    return;
  }

  try {
    await newsStore.toggleFavorite(props.news.id);
    emit('favorite', props.news.id);
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition:
    transform var(--transition-duration),
    box-shadow var(--transition-duration);
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.news-card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.news-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-category-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.news-card-content {
  padding: 1rem;
}

.news-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.news-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  color: var(--primary-color);
  font-size: 0.75rem;
  background-color: var(--highlight-bg);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
}

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  .news-card-image {
    height: 160px;
  }
}
</style>
