<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { apiClient } from '@/api/client';
import { newsService } from '@/services/news.service';
import { formatDate } from '@/utils/formatDate';
import { NewsStatus, type News } from '@/types';

const news = ref<News[]>([]);
const loading = ref(false);
const statusFilter = ref<NewsStatus>(NewsStatus.PENDING);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');
const deleteConfirm = ref(false);
const deleteId = ref('');

function showMessage(message: string, color: 'success' | 'error' = 'success') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

async function loadNews() {
  loading.value = true;
  try {
    const response = await newsService.getNews({
      status: statusFilter.value,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    news.value = response.data;
  } catch {
    showMessage('Ошибка загрузки', 'error');
  } finally {
    loading.value = false;
  }
}

async function handleModerate(id: string, status: NewsStatus) {
  try {
    await apiClient.patch(`/news/${id}/moderate`, { status });
    showMessage(status === NewsStatus.PUBLISHED ? 'Опубликовано/Восстановлено' : 'Отклонено');
    await loadNews();
  } catch {
    showMessage('Ошибка', 'error');
  }
}

function confirmDelete(id: string) {
  deleteId.value = id;
  deleteConfirm.value = true;
}

async function handleDelete() {
  try {
    await apiClient.delete(`/news/${deleteId.value}`);
    showMessage('Новость удалена');
    deleteConfirm.value = false;
    await loadNews();
  } catch {
    showMessage('Ошибка удаления', 'error');
  }
}

onMounted(loadNews);
watch(statusFilter, loadNews);
</script>

<template>
  <div>
    <v-tabs v-model="statusFilter" class="mb-4">
      <v-tab :value="NewsStatus.PENDING">
        <v-icon start>mdi-clock-outline</v-icon>
        На модерации
      </v-tab>
      <v-tab :value="NewsStatus.PUBLISHED">
        <v-icon start>mdi-check-circle-outline</v-icon>
        Опубликованные
      </v-tab>
      <v-tab :value="NewsStatus.REJECTED">
        <v-icon start>mdi-close-circle-outline</v-icon>
        Отклоненные
      </v-tab>
      <v-tab :value="NewsStatus.ARCHIVED">
        <v-icon start>mdi-archive-outline</v-icon>
        Архив
      </v-tab>
    </v-tabs>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-table>
      <thead>
        <tr>
          <th>Заголовок</th>
          <th>Категория</th>
          <th>Тип</th>
          <th>Дата</th>
          <th>Просмотры</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in news" :key="item.id">
          <td class="text-truncate" style="max-width: 240px">{{ item.title }}</td>
          <td>
            <v-chip size="small">{{ item.category }}</v-chip>
          </td>
          <td>
            <v-chip size="small" :color="item.isAiGenerated ? 'info' : 'success'" variant="tonal">
              <v-icon v-if="item.isAiGenerated" start size="small">mdi-robot</v-icon>
              {{ item.isAiGenerated ? 'AI' : 'Пользователь' }}
            </v-chip>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item.views }}</td>
          <td>
            <div class="d-flex gap-1 flex-wrap">
              <template v-if="item.status === NewsStatus.PENDING">
                <v-btn size="x-small" color="success" variant="tonal" prepend-icon="mdi-check-circle" @click="handleModerate(item.id, NewsStatus.PUBLISHED)">
                  Опубликовать
                </v-btn>
                <v-btn size="x-small" color="error" variant="tonal" prepend-icon="mdi-close-circle" @click="handleModerate(item.id, NewsStatus.REJECTED)">
                  Отклонить
                </v-btn>
              </template>
              <template v-if="item.status === NewsStatus.PUBLISHED">
                <v-btn size="x-small" variant="tonal" @click="handleModerate(item.id, NewsStatus.ARCHIVED)">В архив</v-btn>
                <v-btn size="x-small" variant="tonal" @click="handleModerate(item.id, NewsStatus.PENDING)">На модерацию</v-btn>
              </template>
              <template v-if="item.status === NewsStatus.ARCHIVED">
                <v-btn size="x-small" variant="tonal" prepend-icon="mdi-undo" @click="handleModerate(item.id, NewsStatus.PUBLISHED)">Восстановить</v-btn>
                <v-btn size="x-small" color="error" variant="tonal" prepend-icon="mdi-delete" @click="confirmDelete(item.id)">Удалить</v-btn>
              </template>
            </div>
          </td>
        </tr>
        <tr v-if="!loading && !news.length">
          <td colspan="6" class="text-center text-medium-emphasis py-6">Нет новостей</td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="deleteConfirm" max-width="400">
      <v-card>
        <v-card-text>Удалить навсегда?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirm = false">Отмена</v-btn>
          <v-btn color="error" @click="handleDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">{{ snackbarMessage }}</v-snackbar>
  </div>
</template>
