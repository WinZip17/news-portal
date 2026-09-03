<script setup lang="ts">
import type { News } from '@/types';

defineProps<{
  item: News;
  categoryLabel: string;
  formattedDate: string;
}>();

defineEmits<{ click: [] }>();

function excerpt(summary?: string) {
  if (!summary) return '';
  return summary.length > 140 ? `${summary.slice(0, 140).trim()}…` : summary;
}
</script>

<template>
  <button type="button" class="newspaper-article" @click="$emit('click')">
    <img class="newspaper-article__image" :src="item.imageUrl" :alt="item.title" loading="lazy" />
    <div class="newspaper-article__category">{{ categoryLabel }}</div>
    <h3 class="newspaper-article__title">{{ item.title }}</h3>
    <p v-if="item.summary" class="newspaper-article__excerpt">{{ excerpt(item.summary) }}</p>
    <div class="newspaper-article__date">{{ formattedDate }}</div>
  </button>
</template>
