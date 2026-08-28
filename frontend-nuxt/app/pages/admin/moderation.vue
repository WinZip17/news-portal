<template>
  <div class="moderation-page">
    <h1 class="page-title">Модерация новостей</h1>

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

        <Column
          field="views"
          header="Просмотры"
          :sortable="true"
          header-class="col-views"
          body-class="col-views"
        >
          <template #body="{ data }">
            {{ data.views ?? 0 }}
          </template>
        </Column>

        <Column header="Действия" header-class="col-actions-wide" body-class="col-actions-wide">
          <template #body="{ data }">
            <div class="actions-cell">
              <Button
                v-if="data.status === 'pending'"
                v-tooltip.top="'Опубликовать'"
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
                v-if="data.status === 'published'"
                v-tooltip.top="'На модерацию'"
                icon="pi pi-clock"
                severity="secondary"
                text
                rounded
                @click="confirmToModeration(data.id)"
              />
              <Button
                v-if="data.status === 'archived'"
                v-tooltip.top="'Восстановить'"
                icon="pi pi-undo"
                severity="success"
                text
                rounded
                :loading="moderatingId === data.id"
                @click="moderateNews(data.id, 'published')"
              />
              <Button
                v-if="data.status === 'archived'"
                v-tooltip.top="'Удалить'"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="confirmDelete(data.id)"
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

    <ConfirmDialog />

    <Dialog
      v-model:visible="viewDialog"
      :header="selectedNews?.title"
      class="dialog-width-md"
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
const { showSuccess, showError } = useAppToast();

const statusFilter = ref('pending');
const viewDialog = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const moderatingId = ref<string | null>(null);

const statusOptions = [
  { label: 'На модерации', value: 'pending' },
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
    pending: 'На модерации',
    published: 'Опубликовано',
    rejected: 'Отклонено',
    archived: 'Архив',
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

async function moderateNews(id: string, status: string) {
  try {
    moderatingId.value = id;
    await newsStore.moderateNews(id, { status: status as NewsStatus });
    const detailByStatus: Record<string, string> = {
      published: 'Опубликовано/Восстановлено',
      rejected: 'Отклонено',
      archived: 'Перемещено в архив',
      pending: 'Отправлено на модерацию',
    };
    showSuccess(detailByStatus[status] || getStatusLabel(status));
    loadNews();
  } catch (error: unknown) {
    showError(getErrorMessage(error, 'Не удалось изменить статус'));
  } finally {
    moderatingId.value = null;
  }
}

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

function confirmToModeration(id: string) {
  confirm.require({
    message: 'Отправить новость на повторную модерацию?',
    header: 'Подтверждение',
    icon: 'pi pi-question-circle',
    acceptLabel: 'На модерацию',
    rejectLabel: 'Отмена',
    accept: () => {
      moderateNews(id, 'pending');
    },
    reject: () => {
      confirm.close();
    },
    onHide: () => {
      confirm.close();
    },
  });
}

async function deleteNews(id: string) {
  try {
    moderatingId.value = id;
    await newsStore.deleteNews(id);
    showSuccess('Новость удалена');
    loadNews();
  } catch (error: unknown) {
    showError(getErrorMessage(error, 'Не удалось удалить новость'));
  } finally {
    moderatingId.value = null;
  }
}

function confirmDelete(id: string) {
  confirm.require({
    message: 'Удалить новость навсегда?',
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteNews(id);
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

:deep(.col-views) {
  width: 100px;
  min-width: 100px;
}

:deep(.col-actions-wide) {
  width: 320px;
  min-width: 320px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
