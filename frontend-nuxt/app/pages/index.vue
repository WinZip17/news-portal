<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Будьте в курсе<br />
          <span class="hero-highlight">актуальных новостей</span>
        </h1>
        <p class="hero-description">
          Современный новостной портал с AI-генерацией контента и персонализированными
          рекомендациями
        </p>
        <div class="hero-actions">
          <NuxtLink to="/news">
            <Button
              label="Читать новости"
              icon="pi pi-arrow-right"
              severity="primary"
              size="large"
            />
          </NuxtLink>
          <NuxtLink v-if="!authStore.isAuthenticated" to="/register">
            <Button
              label="Присоединиться"
              icon="pi pi-user-plus"
              severity="secondary"
              size="large"
            />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Статистика -->
    <section v-if="stats" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <i class="pi pi-file" style="font-size: 2rem; color: var(--primary-color)"></i>
          <div class="stat-value">{{ stats.totalNews }}</div>
          <div class="stat-label">Всего новостей</div>
        </div>
        <div class="stat-card">
          <i class="pi pi-check-circle" style="font-size: 2rem; color: #22c55e"></i>
          <div class="stat-value">{{ stats.publishedNews }}</div>
          <div class="stat-label">Опубликовано</div>
        </div>
        <div class="stat-card">
          <i class="pi pi-users" style="font-size: 2rem; color: #f59e0b"></i>
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Пользователей</div>
        </div>
        <div class="stat-card">
          <i class="pi pi-heart" style="font-size: 2rem; color: #ef4444"></i>
          <div class="stat-value">{{ stats.totalLikes }}</div>
          <div class="stat-label">Лайков</div>
        </div>
      </div>
    </section>

    <!-- Последние новости -->
    <section class="latest-news">
      <div class="section-header">
        <h2 class="section-title">Последние новости</h2>
        <NuxtLink to="/news" class="view-all">
          Все новости <i class="pi pi-arrow-right"></i>
        </NuxtLink>
      </div>

      <div v-if="newsStore.isLoading" class="loading-container">
        <ProgressSpinner />
      </div>

      <div v-else-if="newsStore.error" class="error-container">
        <Message severity="error">{{ newsStore.error }}</Message>
      </div>

      <div v-else class="news-grid">
        <NewsCard
          v-for="item in latestNews"
          :key="item.id"
          :news="item"
          @click="openNewsDetail(item.id)"
        />
      </div>

      <div v-if="!newsStore.isLoading && latestNews.length === 0" class="empty-state">
        <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-color-disabled)"></i>
        <p>Новостей пока нет</p>
      </div>
    </section>

    <!-- Модальное окно новости -->
    <NewsDetailModal v-model:visible="detailModalVisible" :news="selectedNews" />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types';

const authStore = useAuthStore();
const newsStore = useNewsStore();

const detailModalVisible = ref(false);
const selectedNews = ref<NewsItem | null>(null);

const stats = computed(() => newsStore.stats);
const latestNews = computed(() => newsStore.news.slice(0, 6));

// Загрузка данных при SSR и клиенте
await useAsyncData('home-data', async () => {
  await Promise.all([newsStore.fetchStats(), newsStore.fetchNews()]);
});

function openNewsDetail(id: string) {
  selectedNews.value = newsStore.news.find((n: NewsItem) => n.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}
</script>

<style scoped>
.home-page {
  max-width: 100%;
}

/* Hero секция */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  padding: 4rem 2rem;
  border-radius: 1rem;
  margin-bottom: 3rem;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-highlight {
  background: linear-gradient(to right, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Статистика */
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: var(--surface-card);
  padding: 2rem;
  border-radius: var(--border-radius);
  text-align: center;
  border: 1px solid var(--surface-border);
  transition: transform var(--transition-duration);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0.5rem 0;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 500;
}

/* Последние новости */
.latest-news {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all:hover {
  text-decoration: underline;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error-container {
  max-width: 600px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-color-disabled);
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
