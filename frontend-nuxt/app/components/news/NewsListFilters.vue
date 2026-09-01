<template>
  <div class="filters-root">
    <div class="filters-toolbar">
      <IconField class="filters-search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Поиск..." @input="onSearchInput" />
      </IconField>

      <Dropdown
        v-model="sortBy"
        class="filters-sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        aria-label="Сортировка"
        @change="emit('apply')"
      />

      <div class="filters-actions">
        <Button
          type="button"
          label="Фильтры"
          icon="pi pi-filter"
          :badge="secondaryFilterCount > 0 ? String(secondaryFilterCount) : undefined"
          :severity="secondaryFilterCount > 0 ? 'primary' : 'secondary'"
          @click="toggleFilters"
        />

        <OverlayPanel ref="filtersPanelRef" class="filters-panel">
          <div class="filters-panel-content">
            <div class="filter-field">
              <label class="filter-label">Категория</label>
              <Dropdown
                v-model="selectedCategory"
                :options="categories"
                option-label="label"
                option-value="value"
                placeholder="Все категории"
                show-clear
                append-to="self"
                @change="emit('apply')"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Тип новости</label>
              <Dropdown
                v-model="aiFilter"
                :options="aiFilterOptions"
                option-label="label"
                option-value="value"
                append-to="self"
                @change="emit('apply')"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Дата от</label>
              <DatePicker
                v-model="fromDate"
                date-format="dd.mm.yy"
                placeholder="Дата от"
                show-icon
                show-clear
                append-to="self"
                @update:model-value="emit('apply')"
              />
            </div>

            <div class="filter-field">
              <label class="filter-label">Дата до</label>
              <DatePicker
                v-model="toDate"
                date-format="dd.mm.yy"
                placeholder="Дата до"
                show-icon
                show-clear
                append-to="self"
                :min-date="fromDate ?? undefined"
                @update:model-value="emit('apply')"
              />
            </div>
          </div>
        </OverlayPanel>

        <Button
          v-if="hasActiveFilters"
          label="Сбросить"
          aria-label="Сбросить"
          icon="pi pi-filter-slash"
          severity="secondary"
          @click="emit('reset')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsCategory } from '~/types';
import { useDebounceFn } from '@vueuse/core';
import type OverlayPanel from 'primevue/overlaypanel';

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedCategory = defineModel<NewsCategory | null>('selectedCategory', { default: null });
const sortBy = defineModel<string>('sortBy', { default: 'publishedAt' });
const aiFilter = defineModel<'all' | 'true' | 'false'>('aiFilter', { default: 'all' });
const fromDate = defineModel<Date | null>('fromDate', { default: null });
const toDate = defineModel<Date | null>('toDate', { default: null });

defineProps<{
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  search: [];
  apply: [];
  reset: [];
}>();

const filtersPanelRef = ref<InstanceType<typeof OverlayPanel> | null>(null);

const categories = [
  { label: 'Политика', value: 'politics' as NewsCategory },
  { label: 'Экономика', value: 'economy' as NewsCategory },
  { label: 'Технологии', value: 'technology' as NewsCategory },
  { label: 'Наука', value: 'science' as NewsCategory },
  { label: 'Спорт', value: 'sports' as NewsCategory },
  { label: 'Развлечения', value: 'entertainment' as NewsCategory },
  { label: 'Здоровье', value: 'health' as NewsCategory },
  { label: 'Мир', value: 'world' as NewsCategory },
  { label: 'Другое', value: 'other' as NewsCategory },
];

const sortOptions = [
  { label: 'Сначала новые', value: 'publishedAt' },
  { label: 'Сначала старые', value: 'publishedAt_asc' },
  { label: 'По просмотрам', value: 'views' },
  { label: 'По лайкам', value: 'likes' },
];

const aiFilterOptions = [
  { label: 'Все', value: 'all' as const },
  { label: 'AI-рерайт', value: 'true' as const },
  { label: 'Оригиналы', value: 'false' as const },
];

const secondaryFilterCount = computed(
  () =>
    [selectedCategory.value, aiFilter.value !== 'all', fromDate.value, toDate.value].filter(Boolean)
      .length,
);

const debouncedSearch = useDebounceFn(() => {
  emit('search');
}, 500);

function onSearchInput(): void {
  debouncedSearch();
}

function toggleFilters(event: Event): void {
  filtersPanelRef.value?.toggle(event);
}
</script>

<style scoped>
.filters-root {
  width: 100%;
  margin-bottom: 2rem;
}

.filters-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.filters-search {
  width: 100%;
}

.filters-search :deep(.p-inputtext) {
  width: 100%;
}

.filters-sort {
  width: 100%;
}

.filters-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filters-panel-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(280px, calc(100vw - 2rem));
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.filter-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.filter-field :deep(.p-dropdown),
.filter-field :deep(.p-datepicker) {
  width: 100%;
}

@media (min-width: 768px) {
  .filters-toolbar {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .filters-search {
    flex: 1 1 auto;
    min-width: 0;
  }

  .filters-sort {
    flex: 0 0 180px;
    width: 180px;
  }

  .filters-actions {
    flex-shrink: 0;
    flex-wrap: nowrap;
  }
}

@media (max-width: 767px) {
  .filters-actions {
    width: 100%;
  }

  .filters-actions :deep(.p-button) {
    flex: 1 1 auto;
  }
}
</style>
