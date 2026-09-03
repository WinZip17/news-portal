<script setup lang="ts">
import type { News } from '@/types';

defineProps<{
  item: News;
  categoryLabel: string;
  formattedDate: string;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button type="button" class="newspaper-lead" @click="$emit('click')">
    <img class="newspaper-lead__image" :src="item.imageUrl" :alt="item.title" loading="eager" />
    <div class="newspaper-lead__category">{{ categoryLabel }}</div>
    <h2 class="newspaper-lead__title">{{ item.title }}</h2>
    <p v-if="item.summary" class="newspaper-lead__summary">{{ item.summary }}</p>
  </button>
</template>
