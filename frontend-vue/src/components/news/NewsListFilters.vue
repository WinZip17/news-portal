<script setup lang="ts">
const search = defineModel<string>('search', { default: '' });
const category = defineModel<string>('category', { default: 'all' });
const sortBy = defineModel<string>('sortBy', { default: 'publishedAt' });
const aiFilter = defineModel<string>('aiFilter', { default: 'all' });
const fromDate = defineModel<string>('fromDate', { default: '' });
const toDate = defineModel<string>('toDate', { default: '' });

defineProps<{
  hasActiveFilters: boolean;
  categories: Array<{ value: string; label: string }>;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const sortOptions = [
  { value: 'publishedAt', title: '🕒 По дате' },
  { value: 'views', title: '👁 По просмотрам' },
  { value: 'likes', title: '❤️ По лайкам' },
];

const aiFilterOptions = [
  { value: 'all', title: '📋 Все' },
  { value: 'true', title: '🤖 AI-рерайт' },
  { value: 'false', title: '📄 Оригиналы' },
];
</script>

<template>
  <div :class="$style.root">
    <v-text-field
      v-model="search"
      :class="$style.search"
      label="Поиск..."
      density="compact"
      hide-details
      prepend-inner-icon="mdi-magnify"
      clearable
      @keydown.enter="emit('search')"
      @click:clear="emit('search')"
    />

    <div :class="$style.grid">
      <v-select
        v-model="category"
        :class="$style.control"
        :items="categories"
        item-value="value"
        item-title="label"
        density="compact"
        hide-details
      />

      <v-select
        v-model="sortBy"
        :class="$style.control"
        :items="sortOptions"
        density="compact"
        hide-details
      />

      <v-select
        v-model="aiFilter"
        :class="$style.control"
        :items="aiFilterOptions"
        density="compact"
        hide-details
      />

      <v-text-field
        v-model="fromDate"
        :class="$style.control"
        label="Дата от"
        type="date"
        density="compact"
        hide-details
      />

      <v-text-field
        v-model="toDate"
        :class="$style.control"
        label="Дата до"
        type="date"
        density="compact"
        hide-details
        :min="fromDate || undefined"
      />

      <div v-if="hasActiveFilters" :class="[$style.control, $style.actions]">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-filter-off"
          block
          @click="emit('reset')"
        >
          Сбросить
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style module>
.root {
  width: 100%;
  margin-bottom: 16px;
}

.search {
  width: 100%;
  margin-bottom: 12px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
}

@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.control {
  width: 100%;
  min-width: 0;
}

.actions {
  display: flex;
  align-items: flex-end;
}
</style>
