<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { NewsStats } from '@/types';

const props = defineProps<{
  stats: NewsStats | null;
  loading?: boolean;
}>();

const router = useRouter();
const authStore = useAuthStore();

function formatCount(value: number): string {
  return value.toLocaleString('ru-RU');
}

const items = computed(() => {
  if (!props.stats) return [];

  const list = [
    { key: 'today', label: 'Сегодня', value: props.stats.newsToday, link: null },
    { key: 'hour', label: 'За час', value: props.stats.newsLastHour, link: null },
    { key: 'total', label: 'В ленте', value: props.stats.totalNews, link: 'feed' as const },
    { key: 'ai', label: 'AI-рерайт', value: props.stats.totalAiNews, link: null },
    { key: 'views', label: 'Просмотров', value: props.stats.totalViews, link: null },
    { key: 'sources', label: 'Источников', value: props.stats.activeSources, link: null },
  ];

  if (authStore.canAccessAdmin && props.stats.pendingNews > 0) {
    list.push({
      key: 'pending',
      label: 'На модерации',
      value: props.stats.pendingNews,
      link: 'admin' as const,
    });
  }

  return list;
});

function go(link: NonNullable<(typeof items.value)[number]['link']>) {
  if (link === 'feed') {
    router.push('/news');
    return;
  }

  if (link === 'admin') {
    router.push('/admin');
  }
}
</script>

<template>
  <div class="newspaper-masthead__stats" aria-label="Статистика портала">
    <template v-if="loading">
      <div v-for="n in 6" :key="n" class="newspaper-masthead-stat newspaper-masthead-stat--loading">
        <span class="newspaper-masthead-stat__label">&nbsp;</span>
        <span class="newspaper-masthead-stat__value newspaper-masthead-stat__value--bar" />
      </div>
    </template>

    <template v-else-if="items.length">
      <component
        :is="item.link ? 'button' : 'div'"
        v-for="item in items"
        :key="item.key"
        type="button"
        class="newspaper-masthead-stat"
        :class="{ 'newspaper-masthead-stat--clickable': item.link, 'newspaper-masthead-stat--alert': item.key === 'pending' }"
        @click="item.link ? go(item.link) : undefined"
      >
        <span class="newspaper-masthead-stat__label">{{ item.label }}</span>
        <span class="newspaper-masthead-stat__value">{{ formatCount(item.value) }}</span>
      </component>
    </template>
  </div>
</template>
