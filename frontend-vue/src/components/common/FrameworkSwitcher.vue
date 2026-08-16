<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
  current: 'react' | 'vue' | 'next' | 'nuxt';
}>();

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' }
} as const;

type FrameworkKey = keyof typeof frameworks;

const items = (Object.entries(frameworks) as [FrameworkKey, (typeof frameworks)[FrameworkKey]][]).map(([value, { label }]) => ({ value, title: label }));

const selected = ref<FrameworkKey>(props.current);

function onChange(value: FrameworkKey) {
  if (value !== props.current) {
    window.location.href = frameworks[value].url;
  }
}
</script>

<template>
  <v-select
    v-model="selected"
    :items="items"
    item-title="title"
    item-value="value"
    density="compact"
    hide-details
    aria-label="Выбор фреймворка"
    style="max-width: 180px"
    @update:model-value="onChange"
  />
</template>
