<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { userService } from '@/services/user.service';
import type { User } from '@/types';

const PAGE_SIZE = 20;

const users = ref<User[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const editUser = ref<User | null>(null);
const editModal = ref(false);
const deleteConfirm = ref(false);
const deleteId = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const roleOptions = [
  { title: 'Пользователь', value: 'user' },
  { title: 'Модератор', value: 'moderator' },
  { title: 'Администратор', value: 'admin' }
];

const themeOptions = [
  { title: 'Светлая', value: 'light' },
  { title: 'Тёмная', value: 'dark' }
];

function showMessage(message: string, color: 'success' | 'error' = 'success') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function formatDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
}

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    user: 'primary',
    super_admin: 'amber-darken-2'
  };
  return colors[role] || 'grey';
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: 'Админ',
    moderator: 'Модер',
    user: 'Пользователь',
    super_admin: '👑 Суперадмин'
  };
  return labels[role] || role;
}

async function loadUsers() {
  loading.value = true;
  try {
    const response = await userService.getUsers(page.value, PAGE_SIZE);
    users.value = response.data;
    total.value = response.total;
  } catch {
    showMessage('Ошибка загрузки пользователей', 'error');
  } finally {
    loading.value = false;
  }
}

function openEdit(user: User) {
  const raw = toRaw(user);
  editUser.value = {
    ...raw,
    preferences: { ...raw.preferences }
  };
  editModal.value = true;
}

async function handleSave() {
  if (!editUser.value) return;
  try {
    await userService.updateUser(editUser.value.id, {
      email: editUser.value.email,
      username: editUser.value.username,
      firstName: editUser.value.firstName,
      lastName: editUser.value.lastName,
      role: editUser.value.role,
      isActive: editUser.value.isActive,
      preferences: editUser.value.preferences
    });
    showMessage('Пользователь обновлён');
    editModal.value = false;
    await loadUsers();
  } catch {
    showMessage('Ошибка обновления', 'error');
  }
}

function confirmDelete(id: string) {
  deleteId.value = id;
  deleteConfirm.value = true;
}

async function handleDelete() {
  try {
    await userService.deleteUser(deleteId.value);
    showMessage('Пользователь удалён');
    deleteConfirm.value = false;
    await loadUsers();
  } catch {
    showMessage('Ошибка удаления', 'error');
  }
}

onMounted(loadUsers);
watch(page, loadUsers);
</script>

<template>
  <div>
    <h3 class="text-h6 mb-4">Управление пользователями</h3>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-table>
      <thead>
        <tr>
          <th>Пользователь</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Дата регистрации</th>
          <th>Последний вход</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>
            <div>{{ user.username }}</div>
            <div v-if="user.email" class="text-caption text-medium-emphasis">{{ user.email }}</div>
          </td>
          <td>
            <v-chip size="small" :color="getRoleColor(user.role)">{{ getRoleLabel(user.role) }}</v-chip>
          </td>
          <td>
            <v-chip size="small" :color="user.isActive ? 'success' : 'error'" variant="tonal">
              {{ user.isActive ? 'Активен' : 'Заблокирован' }}
            </v-chip>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td>{{ formatDate(user.lastLoginAt) }}</td>
          <td>
            <template v-if="user.role !== 'super_admin'">
              <v-btn class="mr-1" size="x-small" icon="mdi-pencil" @click="openEdit(user)" />
              <v-btn size="x-small" icon="mdi-delete" color="error" @click="confirmDelete(user.id)" />
            </template>
          </td>
        </tr>
        <tr v-if="!loading && !users.length">
          <td colspan="6" class="text-center text-medium-emphasis py-6">Нет пользователей</td>
        </tr>
      </tbody>
    </v-table>

    <div v-if="pageCount > 1" class="d-flex justify-center mt-4">
      <v-pagination v-model="page" :length="pageCount" :total-visible="7" />
    </div>

    <v-dialog v-model="editModal" max-width="520">
      <v-card v-if="editUser">
        <v-card-title>Редактирование пользователя</v-card-title>
        <v-card-text>
          <v-text-field v-model="editUser.email" label="Email" density="compact" class="mb-2" />
          <v-text-field v-model="editUser.username" label="Имя пользователя" density="compact" class="mb-2" />
          <v-text-field v-model="editUser.firstName" label="Имя" density="compact" class="mb-2" />
          <v-text-field v-model="editUser.lastName" label="Фамилия" density="compact" class="mb-2" />
          <v-select v-model="editUser.role" :items="roleOptions" item-title="title" item-value="value" label="Роль" density="compact" class="mb-2" />
          <v-switch v-model="editUser.isActive" label="Активен" color="primary" class="mb-2" />
          <v-select
            v-model="editUser.preferences.theme"
            :items="themeOptions"
            item-title="title"
            item-value="value"
            label="Тема"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="editModal = false">Отмена</v-btn>
          <v-btn color="primary" @click="handleSave">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirm" max-width="400">
      <v-card>
        <v-card-text>Удалить пользователя?</v-card-text>
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
