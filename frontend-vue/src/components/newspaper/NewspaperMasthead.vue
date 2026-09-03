<script setup lang="ts">
import type { NewsStats } from '@/types';

defineProps<{
  stats?: NewsStats | null;
}>();

const today = new Date().toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
</script>

<template>
  <header class="newspaper-masthead">
    <div class="newspaper-masthead__meta">
      <span>{{ today }}</span>
      <span v-if="stats">Сегодня: {{ stats.newsToday }} материалов</span>
      <span v-if="stats">Всего в ленте: {{ stats.totalNews }}</span>
    </div>
    <h1 class="newspaper-masthead__title">Short News</h1>
    <p class="newspaper-masthead__tagline">Короткие новости без манипуляций · AI-рерайт из проверенных источников</p>
  </header>
</template>
