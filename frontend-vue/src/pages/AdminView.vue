<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { newsService } from '@/services/news.service';
import { type News, NewsStatus, type User } from '@/types';
import { apiClient } from '@/api/client';

const router = useRouter();
const authStore = useAuthStore();
const { isAdmin, isAuthenticated } = authStore;

const tab = ref(0);
const news = ref<News[]>([]);
const users = ref<User[]>([]);
const loading = ref(false);
const generating = ref(false);

// Super admin
const isSuperAdmin = authStore.user?.role === 'super_admin';
const superTab = ref(0);
const editItem = ref<News | User | null>(null);
const editModal = ref(false);
const editType = ref<'news' | 'user'>('news');
const deleteConfirm = ref(false);
const deleteItem = ref<{ id: string; type: 'news' | 'user' }>({ id: '', type: 'news' });

onMounted(async () => {
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }
  if (!isAdmin) {
    router.push('/');
    return;
  }
  // Загружаем всё сразу
  await Promise.all([
    (async () => {
      const n = await newsService.getNews({ limit: 50, sortBy: 'createdAt', sortOrder: 'DESC' });
      news.value = n.data;
    })(),
    (async () => {
      const u = await apiClient.get('/auth/users', { params: { limit: 50 } });
      users.value = u.data.data;
    })()
  ]);
  loading.value = false;
});

async function loadData() {
  loading.value = true;
  try {
    if (tab.value === 0) {
      const res = await newsService.getNews({ limit: 50, sortBy: 'createdAt', sortOrder: 'DESC' });
      news.value = res.data;
    } else {
      const res = await apiClient.get('/auth/users', { params: { limit: 50 } });
      users.value = res.data.data;
    }
  } catch {}
  loading.value = false;
}

function handleTabChange(t: number) {
  tab.value = t;
  loadData();
}

async function handleModerate(id: string, status: string) {
  try {
    await apiClient.patch(`/news/${id}/moderate`, { status });
    news.value = news.value.map((n) => (n.id === id ? { ...n, status: status as NewsStatus } : n));
  } catch {}
}

async function handleAutoGenerate() {
  generating.value = true;
  try {
    await apiClient.post('/ai/auto-generate', { countPerCategory: 2 });
    await loadData();
  } catch {}
  generating.value = false;
}

function openEdit(item: News | User, type: 'news' | 'user') {
  editItem.value = item;
  editType.value = type;
  editModal.value = true;
}

async function handleSave() {
  if (!editItem.value) return;
  try {
    if (editType.value === 'news') {
      const n = editItem.value as News;
      await newsService.updateNews(n.id, n);
    } else {
      const u = editItem.value as User;
      await apiClient.put(`/auth/users/${u.id}`, u);
    }
    editModal.value = false;
    loadData();
  } catch {}
}

function confirmDelete(id: string, type: 'news' | 'user') {
  deleteItem.value = { id, type };
  deleteConfirm.value = true;
}

async function handleDelete() {
  try {
    if (deleteItem.value.type === 'news') {
      await apiClient.delete(`/news/${deleteItem.value.id}`);
      news.value = news.value.filter((n) => n.id !== deleteItem.value.id);
    } else {
      await apiClient.delete(`/auth/users/${deleteItem.value.id}`);
      users.value = users.value.filter((u) => u.id !== deleteItem.value.id);
    }
  } catch {}
  deleteConfirm.value = false;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    pending: 'На модерации',
    published: 'Опубликовано',
    rejected: 'Отклонено',
    archived: 'Архив'
  };
  return labels[status] || status;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'warning',
    published: 'success',
    rejected: 'error',
    archived: 'grey'
  };
  return colors[status] || 'grey';
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: '👑 Суперадмин',
    admin: 'Админ',
    moderator: 'Модер',
    user: 'Пользователь'
  };
  return labels[role] || role;
}
</script>

<template>
  <div>
    <h2 class="text-h4 mb-4">Админ-панель</h2>

    <v-tabs v-model="tab" @update:model-value="handleTabChange">
      <v-tab value="0">Новости</v-tab>
      <v-tab value="1">Пользователи</v-tab>
      <v-tab v-if="isSuperAdmin" value="2">👑 Суперадмин</v-tab>
    </v-tabs>

    <!-- Новости -->
    <v-window v-model="tab">
      <v-window-item value="0">
        <v-table>
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
              <td class="text-truncate" style="max-width: 200px">{{ item.title }}</td>
              <td>
                <v-chip size="small">{{ item.category }}</v-chip>
              </td>
              <td>
                <v-chip size="small" :color="getStatusColor(item.status)">{{ getStatusLabel(item.status) }}</v-chip>
              </td>
              <td>{{ new Date(item.createdAt).toLocaleDateString('ru-RU') }}</td>
              <td>
                <div class="d-flex gap-1 flex-wrap">
                  <template v-if="item.status === 'pending'">
                    <v-btn size="x-small" color="success" variant="tonal" @click="handleModerate(item.id, 'published')">Опубликовать</v-btn>
                    <v-btn size="x-small" color="error" variant="tonal" @click="handleModerate(item.id, 'rejected')">Отклонить</v-btn>
                  </template>
                  <v-btn v-if="item.status === 'published'" size="x-small" variant="tonal" @click="handleModerate(item.id, 'archived')">В архив</v-btn>
                  <v-btn v-if="item.status === 'archived'" size="x-small" variant="tonal" @click="handleModerate(item.id, 'published')">Восстановить</v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Пользователи -->
      <v-window-item value="1">
        <v-table>
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
                <v-chip size="small" :color="user.role === 'admin' ? 'error' : 'primary'">{{ getRoleLabel(user.role) }}</v-chip>
              </td>
              <td>{{ user.isActive ? '✅' : '❌' }}</td>
              <td>
                <template v-if="user.role !== 'super_admin'">
                  <v-btn class="mr-2" size="x-small" icon="mdi-pencil" @click="openEdit(user, 'user')" />
                  <v-btn size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(user.id, 'user')" />
                </template>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Суперадмин -->
      <v-window-item v-if="isSuperAdmin" value="2">
        <v-btn color="primary" prepend-icon="mdi-rocket" :loading="generating" @click="handleAutoGenerate" class="mb-4"> Сгенерировать новости </v-btn>

        <v-tabs v-model="superTab">
          <v-tab value="0">Новости</v-tab>
          <v-tab value="1">Пользователи</v-tab>
        </v-tabs>

        <v-window v-model="superTab">
          <v-window-item value="0">
            <v-table>
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
                  <td class="text-truncate" style="max-width: 200px">{{ item.title }}</td>
                  <td>
                    <v-chip size="small">{{ item.category }}</v-chip>
                  </td>
                  <td>
                    <v-chip size="small" :color="getStatusColor(item.status)">{{ getStatusLabel(item.status) }}</v-chip>
                  </td>
                  <td>{{ new Date(item.createdAt).toLocaleDateString('ru-RU') }}</td>
                  <td>
                    <v-btn size="x-small" icon="mdi-pencil" @click="openEdit(item, 'news')" />
                    <v-btn size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(item.id, 'news')" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>
          <v-window-item value="1">
            <v-table>
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
                    <v-chip size="small" :color="user.role === 'admin' ? 'error' : 'primary'">{{ getRoleLabel(user.role) }}</v-chip>
                  </td>
                  <td>{{ user.isActive ? '✅' : '❌' }}</td>
                  <td>
                    <v-btn size="x-small" icon="mdi-pencil" @click="openEdit(user, 'user')" />
                    <v-btn v-if="user.role !== 'super_admin'" size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(user.id, 'user')" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>
        </v-window>
      </v-window-item>
    </v-window>

    <!-- Edit Modal -->
    <v-dialog v-model="editModal" max-width="500">
      <v-card v-if="editItem">
        <v-card-title>Редактировать</v-card-title>
        <v-card-text>
          <template v-if="editType === 'news'">
            <v-text-field v-model="(editItem as News).title" label="Заголовок" density="compact" class="mb-2" />
            <v-textarea v-model="(editItem as News).summary" label="Краткое описание" density="compact" rows="3" class="mb-2" />
            <v-textarea v-model="(editItem as News).content" label="Контент" density="compact" rows="5" />
          </template>
          <template v-else>
            <v-text-field v-model="(editItem as User).email" label="Email" density="compact" class="mb-2" />
            <v-text-field v-model="(editItem as User).username" label="Username" density="compact" class="mb-2" />
            <v-select v-model="(editItem as User).role" :items="['user', 'moderator', 'admin']" label="Роль" density="compact" />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="editModal = false">Отмена</v-btn>
          <v-btn color="primary" @click="handleSave">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <v-dialog v-model="deleteConfirm" max-width="400">
      <v-card>
        <v-card-text>Вы уверены, что хотите удалить?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirm = false">Отмена</v-btn>
          <v-btn color="error" @click="handleDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
