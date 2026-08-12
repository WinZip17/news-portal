<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { newsService } from '@/services/news.service';
import { useAuthStore } from '@/stores/auth';
import type { News } from '@/types';

const props = defineProps<{ news: News }>();
const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();
const isLiked = ref(false);
const isFavorited = ref(false);
const likesCount = ref(props.news.likes || 0);
const fullNews = ref<News | null>(null);
const loading = ref(true);
const snackbar = ref('');

onMounted(async () => {
  try {
    fullNews.value = await newsService.getNewsById(props.news.id);
    likesCount.value = fullNews.value.likes || 0;
  } catch {}
  loading.value = false;
  checkState();
});

async function checkState() {
  if (!authStore.isAuthenticated) return;
  try {
    const [liked, favorited] = await Promise.all([newsService.isLiked(props.news.id), newsService.isFavorited(props.news.id)]);
    isLiked.value = liked;
    isFavorited.value = favorited;
  } catch {}
}

async function handleLike() {
  if (!authStore.isAuthenticated) {
    snackbar.value = 'Войдите, чтобы ставить лайки';
    return;
  }
  try {
    const result = await newsService.toggleLike(props.news.id);
    isLiked.value = result.liked;
    likesCount.value = result.likes;
  } catch {}
}

async function handleFavorite() {
  if (!authStore.isAuthenticated) {
    snackbar.value = 'Войдите, чтобы добавлять в избранное';
    return;
  }
  try {
    const result = await newsService.toggleFavorite(props.news.id);
    isFavorited.value = result.favorited;
  } catch {}
}

async function handleShare() {
  const url = `${window.location.origin}/?news=${props.news.id}`;
  try {
    await navigator.share({ title: props.news.title, text: props.news.summary, url });
  } catch {
    await navigator.clipboard.writeText(url);
    snackbar.value = 'Ссылка скопирована';
  }
}
</script>

<template>
  <v-card v-if="fullNews || !loading">
    <v-card-item>
      <v-alert :type="fullNews?.isAiGenerated ? 'info' : 'success'" :text="fullNews?.isAiGenerated ? '🤖 AI-рерайт новости' : '📄 Оригинальная новость'" variant="tonal" class="mb-4" />
      <v-card-title class="text-h5">{{ fullNews?.title }}</v-card-title>
      <v-card-subtitle class="mt-2">
        <span class="mr-4">📅 {{ new Date(fullNews?.publishedAt || '').toLocaleDateString('ru-RU') }}</span>
        <span class="mr-4">👁 {{ fullNews?.views || 0 }}</span>
        <span v-if="fullNews?.author">✍️ {{ fullNews.author }}</span>
      </v-card-subtitle>
    </v-card-item>

    <v-card-actions>
      <v-btn :prepend-icon="isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" :color="isLiked ? 'primary' : undefined" @click="handleLike">{{ likesCount }}</v-btn>
      <v-btn :prepend-icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'" :color="isFavorited ? 'error' : undefined" @click="handleFavorite">{{
        isFavorited ? 'В избранном' : 'В избранное'
      }}</v-btn>
      <v-btn prepend-icon="mdi-share-variant" @click="handleShare">Поделиться</v-btn>
    </v-card-actions>

    <v-card-text>
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-chip color="primary" size="small">{{ fullNews?.category }}</v-chip>
        <v-chip v-if="fullNews?.isAiGenerated" color="secondary" size="small">AI-рерайт</v-chip>
        <v-chip v-if="fullNews?.source" variant="outlined" size="small">{{ fullNews.source }}</v-chip>
      </div>

      <v-img v-if="fullNews?.imageUrl" :src="fullNews.imageUrl" height="400" cover class="mb-4 rounded" />

      <p class="text-body-1 font-weight-medium mb-4" v-if="fullNews?.summary">{{ fullNews.summary }}</p>
      <div v-html="fullNews?.content" class="text-body-1" />

      <a v-if="fullNews?.sourceUrl" :href="fullNews.sourceUrl" target="_blank" class="d-block mt-4 text-primary">Читать оригинал на {{ fullNews.source || 'источнике' }}</a>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn @click="emit('close')">Закрыть</v-btn>
    </v-card-actions>
  </v-card>

  <v-card v-else class="pa-8 text-center">
    <v-progress-circular indeterminate />
  </v-card>

  <v-snackbar :model-value="!!snackbar" :timeout="3000">{{ snackbar }}</v-snackbar>
</template>
