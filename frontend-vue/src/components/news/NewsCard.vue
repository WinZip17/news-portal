<script setup lang="ts">
import type { News } from '@/types';

defineProps<{
  item: News;
  categoryColor: string;
  categoryLabel: string;
  formattedDate: string;
}>();
</script>

<template>
  <v-card hover class="h-100" @click="$emit('click')">
    <v-img v-if="item.imageUrl" :src="item.imageUrl" height="160" cover />
    <div v-else class="d-flex align-center justify-center text-h3" style="height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white">📰</div>
    <v-card-title class="text-body-1 font-weight-bold">{{ item.title }}</v-card-title>
    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ item.summary?.substring(0, 120) || 'Описание отсутствует' }}...</p>
      <div class="d-flex flex-wrap gap-2 align-center">
        <v-chip :color="categoryColor" size="small" label>{{ categoryLabel }}</v-chip>
        <v-chip v-if="item.isAiGenerated" color="secondary" size="small" label>AI</v-chip>
        <v-chip v-else color="success" size="small" label>Оригинал</v-chip>
        <span class="text-caption text-medium-emphasis ml-auto">
          {{ formattedDate }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>
