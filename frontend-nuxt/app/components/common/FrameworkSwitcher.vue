<template>
  <select
    :value="currentValue"
    class="framework-switcher"
    aria-label="Выбор фреймворка"
    @change="handleChange"
  >
    <option v-for="(framework, key) in frameworks" :key="key" :value="key">
      {{ framework.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface Framework {
  label: string;
  url: string;
}

type FrameworkKey = 'react' | 'next' | 'nuxt';

const frameworks: Record<FrameworkKey, Framework> = {
  react: { label: '⚛️ React SPA', url: 'https://short-news.ru' },
  next: { label: '🔵 Next.js', url: 'https://next.short-news.ru' },
  nuxt: { label: '🟣 Nuxt', url: 'https://nuxt.short-news.ru' },
  // nestjs: { label: '🟢 NestJS SSR + React', url: 'https://nest.short-news.ru' },
};
const currentValue = ref('nuxt');
function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const value = target.value as FrameworkKey;
  window.location.href = frameworks[value].url;
}
</script>

<style scoped>
.framework-switcher {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #00dc82;
  background: #020420;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.framework-switcher:hover {
  border-color: #00dc82;
  box-shadow: 0 0 8px rgba(0, 220, 130, 0.3);
}

.framework-switcher:focus {
  border-color: #00dc82;
  box-shadow: 0 0 0 2px rgba(0, 220, 130, 0.2);
}

.framework-switcher option {
  background: #020420;
  color: #fff;
  padding: 8px;
}
</style>

<!-- Не-scoped стили для поддержки тем -->
<style>
/* Тёмная тема */
.p-dark .framework-switcher {
  background: #020420;
  border-color: #00dc82;
}

.p-dark .framework-switcher option {
  background: #020420;
  color: #fff;
}

/* Светлая тема */
:root:not(.p-dark) .framework-switcher {
  background: #f0fdf4;
  color: #020420;
  border-color: #00dc82;
}

:root:not(.p-dark) .framework-switcher option {
  background: #fff;
  color: #020420;
}

:root:not(.p-dark) .framework-switcher option:disabled {
  color: #00dc82;
}
</style>
