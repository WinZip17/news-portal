<script setup lang="ts">
import type { News } from '@/types';

defineProps<{
  item: News;
  index: number;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button type="button" class="newspaper-teaser" @click="$emit('click')">
    <span class="newspaper-teaser__media">
      <img class="newspaper-teaser__thumb" :src="item.imageUrl" :alt="item.title" loading="lazy" />
      <span class="newspaper-teaser__index" aria-hidden="true">{{ index }}</span>
    </span>
    <h3 class="newspaper-teaser__title">{{ item.title }}</h3>
  </button>
</template>
