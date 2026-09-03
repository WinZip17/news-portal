<script setup lang="ts">
import type { News } from '@/types';

defineProps<{
  items: News[];
}>();

defineEmits<{ select: [news: News] }>();
</script>

<template>
  <aside class="newspaper-brief" aria-label="Коротко">
    <h2 class="newspaper-brief__heading">Коротко</h2>
    <ul class="newspaper-brief__list">
      <li v-for="item in items" :key="item.id">
        <button type="button" class="newspaper-brief-item" @click="$emit('select', item)">
          <img class="newspaper-brief-item__thumb" :src="item.imageUrl" :alt="item.title" loading="lazy" />
          <p class="newspaper-brief-item__title">{{ item.title }}</p>
        </button>
      </li>
    </ul>
  </aside>
</template>
