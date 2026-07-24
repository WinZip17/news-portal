<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      :header="news?.title"
      :style="{ width: '90vw', maxWidth: '800px' }"
      :breakpoints="{ '768px': '95vw' }"
      :closable="true"
      :dismissable-mask="true"
  >
    <div v-if="news" class="news-detail">
      <!-- Изображение -->
      <div v-if="news.imageUrl" class="detail-image">
        <img :src="news.imageUrl" :alt="news.title" />
      </div>

      <!-- Мета информация -->
      <div class="detail-meta">
        <span class="meta-badge">
          <i class="pi pi-tag"></i>
          {{ categoryLabel }}
        </span>
        <span class="meta-item">
          <i class="pi pi-eye"></i>
          {{ news.views }} просмотров
        </span>
        <span class="meta-item">
          <i class="pi pi-calendar"></i>
          {{ formatDate(news.publishedAt || news.createdAt) }}
        </span>
        <span v-if="news.source" class="meta-item">
          <i class="pi pi-globe"></i>
          {{ news.source }}
        </span>
      </div>

      <!-- Автор -->
      <div v-if="news.author" class="detail-author">
        <Avatar
            :label="getAuthorInitials(news.author)"
            style="background-color: var(--p-primary-color); color: white"
            shape="circle"
        />
        <div>
          <p class="author-name">{{ news.author.firstName }} {{ news.author.lastName }}</p>
          <p class="author-username">@{{ news.author.username }}</p>
        </div>
      </div>

      <!-- Контент -->
      <div class="detail-content" v-html="news.content"></div>

      <!-- Теги -->
      <div v-if="news.tags?.length" class="detail-tags">
        <span v-for="tag in news.tags" :key="tag" class="tag"> #{{ tag }} </span>
      </div>

      <!-- Действия -->
      <div class="detail-actions">
        <Button
            :icon="news.isLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
            :label="`${news.likes}`"
            :severity="news.isLiked ? 'danger' : 'secondary'"
            :disabled="!authStore.isAuthenticated"
            @click="handleLike"
        />
        <Button
            :icon="news.isFavorite ? 'pi pi-star-fill' : 'pi pi-star'"
            :label="news.isFavorite ? 'В избранном' : 'В избранное'"
            :severity="news.isFavorite ? 'warning' : 'secondary'"
            :disabled="!authStore.isAuthenticated"
            @click="handleToggleFavorite"
        />
        <Button icon="pi pi-share-alt" label="Поделиться" severity="info" @click="shareNews" />
      </div>

      <!-- Источник -->
      <div v-if="news.sourceUrl" class="detail-source">
        <a :href="news.sourceUrl" target="_blank" rel="noopener noreferrer">
          <i class="pi pi-external-link"></i>
          Читать оригинал
        </a>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { NewsItem, UserResponse } from '~/types';

const props = defineProps<{
  news: NewsItem | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  like: [id: string];
  favorite: [id: string];
}>();

const authStore = useAuthStore();
const newsStore = useNewsStore();
const toast = useToast();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const categoryLabel = computed(() => {
  if (!props.news) return '';
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

function getAuthorInitials(author: UserResponse): string {
  const first = author.firstName?.[0] || author.username[0];
  const last = author.lastName?.[0] || '';
  return (first + last).toUpperCase();
}

async function handleLike() {
  if (!props.news) return;

  if (!authStore.isAuthenticated) {
    toast.add({
      severity: 'warn',
      summary: 'Требуется авторизация',
      detail: 'Войдите, чтобы ставить лайки',
      life: 3000,
    });
    return;
  }

  try {
    await newsStore.likeNews(props.news.id);
    emit('like', props.news.id);
  } catch (error) {
    console.error('Error liking news:', error);
  }
}

async function handleToggleFavorite() {
  if (!props.news) return;

  if (!authStore.isAuthenticated) {
    toast.add({
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

async function shareNews() {
  if (!props.news) return;

  const shareData = {
    title: props.news.title,
    text: props.news.summary || props.news.title,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.add({
        severity: 'success',
        summary: 'Ссылка скопирована',
        detail: 'Ссылка на новость скопирована в буфер обмена',
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.news-detail {
  padding: 0;
}

.detail-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.meta-badge {
  background-color: var(--p-primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--p-surface-hover);
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.author-name {
  font-weight: 600;
  color: var(--p-text-color);
}

.author-username {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.detail-content {
  line-height: 1.8;
  color: var(--p-text-color);
  margin-bottom: 1.5rem;
}

.detail-content :deep(p) {
  margin-bottom: 1rem;
}

.detail-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.tag {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.detail-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-top: 1px solid var(--p-surface-border);
  border-bottom: 1px solid var(--p-surface-border);
  margin-bottom: 1rem;
}

.detail-source {
  text-align: center;
  padding: 0.5rem 0;
}

.detail-source a {
  color: var(--p-primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.detail-source a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .detail-image {
    max-height: 250px;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>