<template>
  <div class="moderation-page">
    <h1 class="page-title">Модерация новостей</h1>

    <!-- Фильтр по статусу -->
    <div class="filter-bar">
      <SelectButton
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        @change="loadNews"
      />
    </div>

    <div v-if="newsStore.isLoading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else class="moderation-list">
      <DataTable
        :value="newsStore.news"
        :paginator="true"
        :rows="10"
        :rows-per-page-options="[10, 20, 50]"
        paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        current-page-report-template="Показано с {first} по {last} из {totalRecords}"
      >
        <Column field="title" header="Заголовок" :sortable="true">
          <template #body="{ data }">
            <div class="news-title-cell">
              <span class="news-title">{{ data.title }}</span>
              <span v-if="data.isAiGenerated" class="ai-badge">AI</span>
            </div>
          </template>
        </Column>

        <Column field="category" header="Категория" :sortable="true">
          <template #body="{ data }">
            <span class="category-badge">{{ getCategoryLabel(data.category) }}</span>
          </template>
        </Column>

        <Column field="status" header="Статус" :sortable="true">
          <template #body="{ data }">
            <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
          </template>
        </Column>

        <Column field="createdAt" header="Дата" :sortable="true">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column header="Действия" style="width: 250px">
          <template #body="{ data }">
            <div class="actions-cell">
              <Button
                v-if="data.status === 'pending'"
                v-tooltip.top="'Одобрить'"
                icon="pi pi-check"
                severity="success"
                text
                rounded
                :loading="moderatingId === data.id"
                @click="moderateNews(data.id, 'published')"
              />
              <Button
                v-if="data.status === 'pending'"
                v-tooltip.top="'Отклонить'"
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                @click="confirmReject(data.id)"
              />
              <Button
                v-if="data.status === 'published'"
                v-tooltip.top="'В архив'"
                icon="pi pi-inbox"
                severity="warning"
                text
                rounded
                @click="confirmArchive(data.id)"
              />
              <Button
                v-tooltip.top="'Просмотр'"
                icon="pi pi-eye"
                severity="info"
                text
                rounded
                @click="viewNews(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Диалог подтверждения -->
    <ConfirmDialog />

    <!-- Просмотр новости -->
    <Dialog
      v-model:visible="viewDialog"
      :header="selectedNews?.title"
      :style="{ width: '700px' }"
      :modal="true"
    >
      <div v-if="selectedNews" class="news-preview">
        <div class="preview-meta">
          <Tag
            :severity="getStatusSeverity(selectedNews.status)"
            :value="getStatusLabel(selectedNews.status)"
          />
          <span class="preview-category">{{ getCategoryLabel(selectedNews.category) }}</span>
        </div>
        <div class="preview-content" v-html="selectedNews.content"></div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, NewsStatus } from '~/types';
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const newsStore = useNewsStore();
const authStore = useAuthStore();
const confirm = useConfirm();
const toast = useToast();

const statusFilter = ref('pending');
const viewDialog = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const moderatingId = ref<string | null>(null);

const statusOptions = [
  { label: 'На проверке', value: 'pending' },
  { label: 'Опубликованные', value: 'published' },
  { label: 'Отклоненные', value: 'rejected' },
  { label: 'Архив', value: 'archived' },
];

if (!authStore.isModerator) {
  navigateTo('/');
}

onMounted(() => {
  loadNews();
});

function loadNews() {
  newsStore.setFilter({ status: statusFilter.value as NewsStatus });
  newsStore.fetchNews();
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    politics: 'Политика',
    economy: 'Экономика',
    technology: 'Технологии',
    science: 'Наука',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    health: 'Здоровье',
    world: 'Мир',
    other: 'Другое',
  };
  return labels[category] || category;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    pending: 'На проверке',
    published: 'Опубликовано',
    rejected: 'Отклонено',
    archived: 'В архиве',
  };
  return labels[status] || status;
}

function getStatusSeverity(status: string): string {
  const severities: Record<string, string> = {
    draft: 'secondary',
    pending: 'warning',
    published: 'success',
    rejected: 'danger',
    archived: 'info',
  };
  return severities[status] || 'secondary';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Одобрить — без подтверждения
async function moderateNews(id: string, status: string) {
  try {
    moderatingId.value = id;
    await newsStore.moderateNews(id, { status: status as NewsStatus });
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Новость ${getStatusLabel(status).toLowerCase()}`,
      life: 3000,
    });
    loadNews();
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: getErrorMessage(error, 'Не удалось изменить статус'),
      life: 3000,
    });
  } finally {
    moderatingId.value = null;
  }
}

// Отклонить — с подтверждением
function confirmReject(id: string) {
  confirm.require({
    message: 'Вы уверены, что хотите отклонить новость?',
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Отклонить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: () => {
      moderateNews(id, 'rejected');
    },
    reject: () => {
      confirm.close();
    },
    onHide: () => {
      confirm.close();
    },
  });
}
// В архив — с подтверждением
function confirmArchive(id: string) {
  confirm.require({
    message: 'Вы уверены, что хотите переместить новость в архив?',
    header: 'Подтверждение',
    icon: 'pi pi-question-circle',
    acceptLabel: 'В архив',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-warning',
    accept: () => {
      moderateNews(id, 'archived');
    },
    reject: () => {
      confirm.close();
    },
    onHide: () => {
      confirm.close();
    },
  });
}

function viewNews(news: NewsItem) {
  selectedNews.value = news;
  viewDialog.value = true;
}
</script>

<style scoped>
.moderation-page {
  max-width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin-bottom: 2rem;
}

.filter-bar {
  margin-bottom: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.news-title-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.news-title {
  font-weight: 500;
  color: var(--p-text-color);
}

.ai-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.category-badge {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

.news-preview {
  padding: 1rem 0;
}

.preview-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: center;
}

.preview-category {
  color: var(--p-text-muted-color);
  font-weight: 500;
}

.preview-content {
  line-height: 1.8;
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
