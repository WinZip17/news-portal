<script setup lang="ts">
defineProps<{
  current: 'react' | 'vue' | 'next' | 'nuxt';
}>();

const frameworks = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  vue: { label: '🟢 Vue SPA', url: 'https://vue.short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' }
};

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as keyof typeof frameworks;
  if (value && frameworks[value]) {
    window.location.href = frameworks[value].url;
  }
}
</script>

<template>
  <select :value="current" class="framework-select" aria-label="Выбор фреймворка" @change="onChange">
    <option v-for="(fw, key) in frameworks" :key="key" :value="key">
      {{ fw.label }}
    </option>
  </select>
</template>

<style scoped>
.framework-select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #6c5ce7;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  font-family: inherit;
}

.framework-select option {
  background: #1e1e1e;
  color: #fff;
}
</style>
