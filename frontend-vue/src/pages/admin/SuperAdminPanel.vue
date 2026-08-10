<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue';
import { apiClient } from '@/api/client';
import { aiService } from '@/services/ai.service';
import { newsService } from '@/services/news.service';
import { userService } from '@/services/user.service';
import type { User } from '@/types/auth';
import { NewsCategory, NewsStatus, type News } from '@/types/news';

type TableType = 'news' | 'users';
type ModalType = 'user' | 'news';

const table = ref<TableType>('news');
const news = ref<News[]>([]);
const users = ref<User[]>([]);
const loading = ref(false);
const generating = ref(false);
const editUser = ref<User | null>(null);
const editNews = ref<News | null>(null);
const editModal = ref(false);
const modalType = ref<ModalType>('user');
const deleteConfirm = ref(false);
const deleteItem = ref<{ id: string; type: ModalType }>({ id: '', type: 'news' });
const cronModal = ref(false);
const cronSchedule = ref('0 5,18 * * *');
const cronLoading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');

const tableOptions = [
  { title: 'Новости', value: 'news' },
  { title: 'Пользователи', value: 'users' }
];

const roleOptions = [
  { title: 'Пользователь', value: 'user' },
  { title: 'Модератор', value: 'moderator' },
  { title: 'Администратор', value: 'admin' }
];

const categoryOptions = Object.values(NewsCategory);
const statusOptions = Object.values(NewsStatus);

function showMessage(message: string, color: 'success' | 'error' = 'success') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU');
}

function getRoleLabel(role: string) {
  if (role === 'super_admin') return '👑 Суперадмин';
  return role;
}

function getRoleColor(role: string) {
  if (role === 'super_admin') return 'amber-darken-2';
  if (role === 'admin') return 'error';
  return 'primary';
}

async function loadNews() {
  loading.value = true;
  try {
    const response = await newsService.getNews({ limit: 100, sortBy: 'createdAt', sortOrder: 'DESC' });
    news.value = response.data;
  } catch {
    showMessage('Ошибка загрузки', 'error');
  } finally {
    loading.value = false;
  }
}

async function loadUsers() {
  loading.value = true;
  try {
    const response = await userService.getUsers(1, 100);
    users.value = response.data;
  } catch {
    showMessage('Ошибка загрузки', 'error');
  } finally {
    loading.value = false;
  }
}

async function loadTableData() {
  if (table.value === 'news') {
    await loadNews();
  } else {
    await loadUsers();
  }
}

async function loadCronSchedule() {
  try {
    const response = await aiService.getCronSchedule();
    cronSchedule.value = response.cron;
  } catch {
    // расписание по умолчанию
  }
}

function openEditNews(item: News) {
  const raw = toRaw(item);
  editNews.value = { ...raw, tags: [...raw.tags] };
  modalType.value = 'news';
  editModal.value = true;
}

function openEditUser(user: User) {
  const raw = toRaw(user);
  editUser.value = {
    ...raw,
    preferences: { ...raw.preferences }
  };
  modalType.value = 'user';
  editModal.value = true;
}

async function handleSaveUser() {
  if (!editUser.value) return;
  try {
    await userService.updateUser(editUser.value.id, {
      email: editUser.value.email,
      username: editUser.value.username,
      role: editUser.value.role,
      isActive: editUser.value.isActive
    });
    showMessage('Пользователь сохранён');
    editModal.value = false;
    await loadUsers();
  } catch {
    showMessage('Ошибка сохранения', 'error');
  }
}

async function handleSaveNews() {
  if (!editNews.value) return;
  try {
    await newsService.updateNews(editNews.value.id, {
      title: editNews.value.title,
      content: editNews.value.content,
      summary: editNews.value.summary,
      category: editNews.value.category,
      tags: editNews.value.tags,
      status: editNews.value.status,
      source: editNews.value.source,
      sourceUrl: editNews.value.sourceUrl,
      imageUrl: editNews.value.imageUrl,
      isAiGenerated: editNews.value.isAiGenerated
    });
    showMessage('Новость сохранена');
    editModal.value = false;
    await loadNews();
  } catch {
    showMessage('Ошибка сохранения', 'error');
  }
}

async function handleAutoGenerate() {
  generating.value = true;
  try {
    const result = await aiService.autoGenerate(2);
    showMessage(`Сгенерировано ${result.totalGenerated} новостей`);
    if (table.value === 'news') {
      await loadNews();
    }
  } catch {
    showMessage('Ошибка генерации', 'error');
  } finally {
    generating.value = false;
  }
}

async function handleUpdateCron() {
  cronLoading.value = true;
  try {
    await aiService.updateCronSchedule(cronSchedule.value);
    showMessage('Расписание обновлено');
    cronModal.value = false;
  } catch {
    showMessage('Ошибка обновления расписания', 'error');
  } finally {
    cronLoading.value = false;
  }
}

function confirmDelete(id: string, type: ModalType) {
  deleteItem.value = { id, type };
  deleteConfirm.value = true;
}

async function handleDelete() {
  try {
    if (deleteItem.value.type === 'news') {
      await apiClient.delete(`/news/${deleteItem.value.id}`);
      showMessage('Новость удалена');
      await loadNews();
    } else {
      await userService.deleteUser(deleteItem.value.id);
      showMessage('Пользователь удалён');
      await loadUsers();
    }
    deleteConfirm.value = false;
  } catch {
    showMessage('Ошибка удаления', 'error');
  }
}

onMounted(() => {
  loadTableData();
  loadCronSchedule();
});

watch(table, loadTableData);
</script>

<template>
  <div>
    <h3 class="text-h6 mb-4">
      <v-icon color="amber-darken-2" class="mr-2">mdi-crown</v-icon>
      Панель суперадмина
    </h3>

    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-select v-model="table" :items="tableOptions" item-title="title" item-value="value" density="compact" style="max-width: 220px" hide-details />
      <v-btn color="primary" prepend-icon="mdi-rocket-launch" :loading="generating" @click="handleAutoGenerate">Сгенерировать новости</v-btn>
      <v-btn prepend-icon="mdi-clock-outline" @click="cronModal = true">Расписание</v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-table v-if="table === 'news'">
      <thead>
        <tr>
          <th>Заголовок</th>
          <th>Категория</th>
          <th>Статус</th>
          <th>Дата</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in news" :key="item.id">
          <td class="text-truncate" style="max-width: 240px">{{ item.title }}</td>
          <td><v-chip size="small">{{ item.category }}</v-chip></td>
          <td><v-chip size="small">{{ item.status }}</v-chip></td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>
            <v-btn class="mr-1" size="x-small" icon="mdi-pencil" @click="openEditNews(item)" />
            <v-btn size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(item.id, 'news')" />
          </td>
        </tr>
        <tr v-if="!loading && !news.length">
          <td colspan="5" class="text-center text-medium-emphasis py-6">Нет новостей</td>
        </tr>
      </tbody>
    </v-table>

    <v-table v-else>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Активен</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <v-chip size="small" :color="getRoleColor(user.role)">{{ getRoleLabel(user.role) }}</v-chip>
          </td>
          <td>{{ user.isActive ? '✅' : '❌' }}</td>
          <td>
            <template v-if="user.role !== 'super_admin'">
              <v-btn class="mr-1" size="x-small" icon="mdi-pencil" @click="openEditUser(user)" />
              <v-btn size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(user.id, 'user')" />
            </template>
          </td>
        </tr>
        <tr v-if="!loading && !users.length">
          <td colspan="5" class="text-center text-medium-emphasis py-6">Нет пользователей</td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="editModal" max-width="640">
      <v-card>
        <v-card-title>{{ modalType === 'user' ? 'Редактировать пользователя' : 'Редактировать новость' }}</v-card-title>
        <v-card-text>
          <template v-if="modalType === 'user' && editUser">
            <v-text-field v-model="editUser.email" label="Email" density="compact" class="mb-2" />
            <v-text-field v-model="editUser.username" label="Username" density="compact" class="mb-2" />
            <v-select v-model="editUser.role" :items="roleOptions" item-title="title" item-value="value" label="Роль" density="compact" class="mb-2" />
            <v-switch v-model="editUser.isActive" label="Активен" color="primary" />
          </template>
          <template v-if="modalType === 'news' && editNews">
            <v-text-field v-model="editNews.title" label="Заголовок" density="compact" class="mb-2" />
            <v-textarea v-model="editNews.summary" label="Краткое описание" density="compact" rows="3" class="mb-2" />
            <v-textarea v-model="editNews.content" label="Контент" density="compact" rows="6" class="mb-2" />
            <v-select v-model="editNews.category" :items="categoryOptions" label="Категория" density="compact" class="mb-2" />
            <v-select v-model="editNews.status" :items="statusOptions" label="Статус" density="compact" class="mb-2" />
            <v-text-field v-model="editNews.source" label="Источник" density="compact" class="mb-2" />
            <v-text-field v-model="editNews.sourceUrl" label="URL источника" density="compact" class="mb-2" />
            <v-text-field v-model="editNews.imageUrl" label="URL картинки" density="compact" class="mb-2" />
            <v-switch v-model="editNews.isAiGenerated" label="AI-новость" color="primary" />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="editModal = false">Отмена</v-btn>
          <v-btn color="primary" @click="modalType === 'user' ? handleSaveUser() : handleSaveNews()">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cronModal" max-width="520">
      <v-card>
        <v-card-title>Настройка расписания генерации</v-card-title>
        <v-card-text>
          <v-text-field v-model="cronSchedule" label="Cron-выражение" placeholder="0 5,18 * * *" density="compact" class="mb-2" />
          <p class="text-caption text-medium-emphasis">
            Формат: минута час день месяц день_недели. Пример: 0 5,18 * * * — каждый день в 5:00 и 18:00
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cronModal = false">Отмена</v-btn>
          <v-btn color="primary" :loading="cronLoading" @click="handleUpdateCron">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirm" max-width="400">
      <v-card>
        <v-card-text>Удалить?</v-card-text>
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
