<script setup lang="ts">
import type { NewsStats } from '@/types';
import NewspaperMastheadStats from '@/components/newspaper/NewspaperMastheadStats.vue';

defineProps<{
  stats?: NewsStats | null;
  loading?: boolean;
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
    <p class="newspaper-masthead__date">{{ today }}</p>
    <h1 class="newspaper-masthead__title">Short News</h1>
    <NewspaperMastheadStats :stats="stats ?? null" :loading="loading" />
    <p class="newspaper-masthead__tagline">Короткие новости без манипуляций · AI-рерайт из проверенных источников</p>
  </header>
</template>
