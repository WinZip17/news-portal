<template>
  <div class="admin-news-page">
    <div class="page-header">
      <h1 class="page-title">Управление новостями</h1>
      <Button
        label="Создать новость"
        aria-label="Создать новость"
        icon="pi pi-plus"
        severity="primary"
        @click="createNews"
      />
    </div>

    <DataTable :value="newsStore.news" :paginator="true" :rows="10" :loading="newsStore.isLoading">
      <Column field="title" header="Заголовок" :sortable="true" />
      <Column field="category" header="Категория" :sortable="true">
        <template #body="{ data }">
          {{ getCategoryLabel(data.category) }}
        </template>
      </Column>
      <Column field="status" header="Статус" :sortable="true">
        <template #body="{ data }">
          <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
        </template>
      </Column>
      <Column header="Действия" style="width: 200px">
        <template #body="{ data }">
          <div class="actions-cell">
            <Button icon="pi pi-pencil" severity="info" text rounded @click="editNews(data)" />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="newsDialog"
      :header="editingNews ? 'Редактирование' : 'Создание новости'"
      :style="{ width: '700px' }"
      :modal="true"
    >
      <form class="news-form" @submit.prevent="saveNews">
        <div class="form-field">
          <label>Заголовок *</label>
          <InputText v-model="newsForm.title" class="w-full" />
        </div>

        <div class="form-field">
          <label>Контент *</label>
          <Textarea v-model="newsForm.content" rows="10" class="w-full" />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Категория *</label>
            <Dropdown
              v-model="newsForm.category"
              :options="categories"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="form-field">
            <label>Статус</label>
            <Dropdown
              v-model="newsForm.status"
              :options="statuses"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="form-field">
          <label>Краткое описание</label>
          <Textarea v-model="newsForm.summary" rows="3" class="w-full" />
        </div>

        <div class="form-field">
          <label>URL изображения</label>
          <InputText v-model="newsForm.imageUrl" class="w-full" />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Источник</label>
            <InputText v-model="newsForm.source" class="w-full" />
          </div>
          <div class="form-field">
            <label>URL источника</label>
            <InputText v-model="newsForm.sourceUrl" class="w-full" />
          </div>
        </div>

        <div class="form-actions">
          <Button label="Отмена" severity="secondary" @click="newsDialog = false" />
          <Button type="submit" label="Сохранить" severity="primary" :loading="isSaving" />
        </div>
      </form>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, CreateNewsDto, NewsCategory } from '~/types';
import { NewsStatus } from '~/types';
import { useUtils } from '~/composables/useUtils.ts';
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const newsStore = useNewsStore();
const authStore = useAuthStore();
const confirm = useConfirm();
const { showSuccess, showError } = useAppToast();

const newsDialog = ref(false);
const editingNews = ref<NewsItem | null>(null);
const isSaving = ref(false);

const newsForm = ref({
  title: '',
  content: '',
  summary: '',
  imageUrl: '',
  source: '',
  sourceUrl: '',
  category: '' as NewsCategory,
  status: NewsStatus.PUBLISHED,
  tags: [] as string[],
});

const categories = [
  { label: 'Политика', value: 'politics' },
  { label: 'Экономика', value: 'economy' },
  { label: 'Технологии', value: 'technology' },
  { label: 'Наука', value: 'science' },
  { label: 'Спорт', value: 'sports' },
  { label: 'Развлечения', value: 'entertainment' },
  { label: 'Здоровье', value: 'health' },
  { label: 'Мир', value: 'world' },
  { label: 'Другое', value: 'other' },
];

const statuses = [
  { label: 'Черновик', value: 'draft' },
  { label: 'На проверке', value: 'pending' },
  { label: 'Опубликовано', value: 'published' },
  { label: 'Отклонено', value: 'rejected' },
  { label: 'Архив', value: 'archived' },
];

if (!authStore.isSuperAdmin) {
  navigateTo('/admin');
}

onMounted(() => {
  newsStore.setFilter({ limit: 50 });
  newsStore.fetchNews();
});

function getCategoryLabel(category: string): string {
  return useUtils().getCategoryLabel(category);
}

function getStatusLabel(status: string): string {
  return useUtils().getStatusLabel(status);
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

function createNews() {
  editingNews.value = null;
  newsForm.value = {
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    source: '',
    sourceUrl: '',
    category: '' as NewsCategory,
    status: NewsStatus.PUBLISHED,
    tags: [],
  };
  newsDialog.value = true;
}

function editNews(news: NewsItem) {
  editingNews.value = news;
  newsForm.value = {
    title: news.title,
    content: news.content,
    summary: news.summary || '',
    imageUrl: news.imageUrl || '',
    source: news.source || '',
    sourceUrl: news.sourceUrl || '',
    category: news.category,
    status: news.status,
    tags: news.tags || [],
  };
  newsDialog.value = true;
}

async function saveNews() {
  try {
    isSaving.value = true;

    if (editingNews.value) {
      await newsStore.updateNews(editingNews.value.id, newsForm.value);
      showSuccess('Новость обновлена');
    } else {
      await newsStore.createNews(newsForm.value as CreateNewsDto);
      showSuccess('Новость создана');
    }

    newsDialog.value = false;
    newsStore.fetchNews();
  } catch (error: unknown) {
    showError(getErrorMessage(error, 'Не удалось сохранить новость'));
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(news: NewsItem) {
  confirm.require({
    message: `Вы уверены, что хотите удалить новость "${news.title}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await newsStore.deleteNews(news.id);
        showSuccess('Новость удалена');
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'Не удалось удалить новость'));
      }
    },
    reject: () => {
      confirm.close();
    },
    onHide: () => {
      confirm.close();
    },
  });
}
</script>

<style scoped>
.admin-news-page {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.news-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
