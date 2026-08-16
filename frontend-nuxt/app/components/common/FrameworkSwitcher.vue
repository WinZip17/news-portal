<template>
  <Dropdown
    v-model="selected"
    :options="frameworkOptions"
    option-label="label"
    option-value="value"
    aria-label="Выбор фреймворка"
    class="framework-switcher"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
interface Framework {
  label: string;
  url: string;
}

type FrameworkKey = 'react' | 'next' | 'nuxt' | 'vue';

const props = withDefaults(
  defineProps<{
    current?: FrameworkKey;
  }>(),
  { current: 'nuxt' },
);

const frameworks: Record<FrameworkKey, Framework> = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
};

const frameworkOptions = (Object.entries(frameworks) as [FrameworkKey, Framework][]).map(
  ([value, { label }]) => ({ value, label }),
);

const selected = ref<FrameworkKey>(props.current);

function handleChange() {
  const value = selected.value;
  if (value !== props.current) {
    window.location.href = frameworks[value].url;
  }
}
</script>

<style scoped>
.framework-switcher {
  min-width: 150px;
}
</style>
