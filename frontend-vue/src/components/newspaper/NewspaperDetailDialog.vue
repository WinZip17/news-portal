<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { newsService } from '@/services/news.service';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { formatDate } from '@/utils/formatDate';
import { useUIStore } from '@/stores/ui';
import type { News } from '@/types';

const props = defineProps<{
  news: News | null;
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const uiStore = useUIStore();

const fullNews = ref<News | null>(null);
const loading = ref(false);

async function loadFullNews() {
  if (!props.news) return;
  loading.value = true;
  try {
    fullNews.value = await newsService.getNewsById(props.news.id);
  } catch {
    fullNews.value = props.news;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.news) {
      fullNews.value = props.news;
      void loadFullNews();
    }
  },
);

onMounted(() => {
  if (props.modelValue && props.news) {
    fullNews.value = props.news;
    void loadFullNews();
  }
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="720" @update:model-value="emit('update:modelValue', $event)">
    <article v-if="fullNews" class="newspaper-detail" :class="{ 'newspaper-detail--watch': uiStore.isDark }">
      <div class="newspaper-detail__category">{{ getCategoryLabel(fullNews.category) }}</div>
      <h2 class="newspaper-detail__title">{{ fullNews.title }}</h2>
      <div class="newspaper-detail__meta">
        {{ formatDate(fullNews.publishedAt ?? fullNews.createdAt) }}
        <span v-if="fullNews.source"> · {{ fullNews.source }}</span>
        <span v-if="fullNews.isAiGenerated"> · AI-рерайт</span>
      </div>
      <img
        v-if="fullNews.imageUrl"
        class="newspaper-detail__image"
        :src="fullNews.imageUrl"
        :alt="fullNews.title"
      />
      <p v-if="fullNews.summary" class="newspaper-detail__summary">{{ fullNews.summary }}</p>
      <div v-if="!loading" class="newspaper-detail__content" v-html="fullNews.content" />
      <div v-else class="newspaper-loading">Загрузка материала…</div>
      <div class="newspaper-detail__actions">
        <a v-if="fullNews.sourceUrl" class="newspaper-link" :href="fullNews.sourceUrl" target="_blank" rel="noopener">
          Оригинал
        </a>
        <button type="button" class="newspaper-link" @click="close">Закрыть</button>
      </div>
    </article>
  </v-dialog>
</template>
