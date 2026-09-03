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
    <img class="newspaper-teaser__thumb" :src="item.imageUrl" :alt="item.title" loading="lazy" />
    <div>
      <div class="newspaper-teaser__index">{{ index }}</div>
      <h3 class="newspaper-teaser__title">{{ item.title }}</h3>
    </div>
  </button>
</template>
