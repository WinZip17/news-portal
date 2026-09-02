<script setup lang="ts">
import { computed, ref } from 'vue';

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

const filtersMenuOpen = ref(false);

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

const secondaryFilterCount = computed(
  () =>
    [category.value !== 'all', aiFilter.value !== 'all', !!fromDate.value, !!toDate.value].filter(Boolean)
      .length,
);

const selectMenuProps = { zIndex: 2500 };
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.toolbar">
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

      <v-select
        v-model="sortBy"
        :class="$style.sort"
        :items="sortOptions"
        density="compact"
        hide-details
        aria-label="Сортировка"
      />

      <div :class="$style.toolbarActions">
        <v-menu
          v-model="filtersMenuOpen"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template #activator="{ props: menuProps }">
            <v-badge
              :content="secondaryFilterCount"
              :model-value="secondaryFilterCount > 0"
              color="primary"
            >
              <v-btn
                v-bind="menuProps"
                :variant="secondaryFilterCount > 0 ? 'flat' : 'outlined'"
                color="primary"
                prepend-icon="mdi-filter"
              >
                Фильтры
              </v-btn>
            </v-badge>
          </template>

          <v-card :class="$style.panel" min-width="280">
            <v-card-text :class="$style.panelContent">
              <div :class="$style.field">
                <span :class="$style.label">Категория</span>
                <v-select
                  v-model="category"
                  :items="categories"
                  item-value="value"
                  item-title="label"
                  density="compact"
                  hide-details
                  :menu-props="selectMenuProps"
                />
              </div>

              <div :class="$style.field">
                <span :class="$style.label">Тип новости</span>
                <v-select
                  v-model="aiFilter"
                  :items="aiFilterOptions"
                  density="compact"
                  hide-details
                  :menu-props="selectMenuProps"
                />
              </div>

              <div :class="$style.field">
                <span :class="$style.label">Дата от</span>
                <v-text-field
                  v-model="fromDate"
                  type="date"
                  density="compact"
                  hide-details
                />
              </div>

              <div :class="$style.field">
                <span :class="$style.label">Дата до</span>
                <v-text-field
                  v-model="toDate"
                  type="date"
                  density="compact"
                  hide-details
                  :min="fromDate || undefined"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-menu>

        <v-btn
          v-if="hasActiveFilters"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-filter-off"
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

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.search {
  width: 100%;
}

.sort {
  width: 100%;
  min-width: 0;
}

.toolbarActions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.panel {
  max-width: min(320px, calc(100vw - 32px));
}

.panelContent {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px !important;
}

.field {
  width: 100%;
  min-width: 0;
}

.label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .search {
    flex: 1 1 auto;
    min-width: 0;
  }

  .sort {
    flex: 0 0 180px;
    width: 180px;
  }

  .toolbarActions {
    flex-shrink: 0;
    flex-wrap: nowrap;
  }
}

@media (max-width: 767px) {
  .toolbarActions {
    width: 100%;
  }

  .toolbarActions :global(.v-btn) {
    flex: 1 1 auto;
  }
}
</style>
