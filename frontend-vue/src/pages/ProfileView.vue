<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { newsService } from '@/services/news.service';
import type { News } from '@/types';
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const { user, isAuthenticated } = storeToRefs(authStore);

const tab = ref(0);
const favorites = ref<News[]>([]);
const loadingFavorites = ref(false);

// Profile form
const firstName = ref('');
const lastName = ref('');
const profileError = ref('');
const profileSuccess = ref('');

// Password form
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const passwordSuccess = ref('');

// Preferences
const theme = ref<'light' | 'dark'>('dark');
const notificationsEnabled = ref(true);
const prefsError = ref('');
const prefsSuccess = ref('');

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  await authStore.fetchCurrentUser();
  firstName.value = user.value?.firstName || '';
  lastName.value = user.value?.lastName || '';
  theme.value = user.value?.preferences?.theme || 'dark';
  notificationsEnabled.value = user.value?.preferences?.notificationsEnabled ?? true;
  loadFavorites();
});

async function loadFavorites() {
  loadingFavorites.value = true;
  try {
    const res = await newsService.getFavorites();
    favorites.value = res.data;
  } catch {}
  loadingFavorites.value = false;
}

async function handleSaveProfile() {
  profileError.value = '';
  profileSuccess.value = '';
  try {
    await authStore.updateProfile({ firstName: firstName.value, lastName: lastName.value });
    profileSuccess.value = 'Профиль обновлен';
  } catch (err: unknown) {
    profileError.value = err instanceof Error ? err.message : 'Ошибка';
  }
}

async function handleChangePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Пароли не совпадают';
    return;
  }
  try {
    await authStore.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });
    passwordSuccess.value = 'Пароль изменен';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: unknown) {
    passwordError.value = err instanceof Error ? err.message : 'Ошибка';
  }
}

async function handleSavePreferences() {
  prefsError.value = '';
  prefsSuccess.value = '';
  try {
    await authStore.updatePreferences({
      theme: theme.value,
      notificationsEnabled: notificationsEnabled.value
    });
    uiStore.setTheme(theme.value);
    prefsSuccess.value = 'Настройки сохранены';
  } catch (err: unknown) {
    prefsError.value = err instanceof Error ? err.message : 'Ошибка';
  }
}

async function removeFavorite(id: string) {
  await newsService.toggleFavorite(id);
  favorites.value = favorites.value.filter((f) => f.id !== id);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU');
}
useHead({ title: 'Профиль' });
</script>

<template>
  <v-container v-if="user">
    <h2 class="text-h4 mb-4">Личный кабинет</h2>

    <v-tabs v-model="tab">
      <v-tab value="0">Профиль</v-tab>
      <v-tab value="1">Пароль</v-tab>
      <v-tab value="2">Настройки</v-tab>
      <v-tab value="3">Избранное ({{ favorites.length }})</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Профиль -->
      <v-window-item value="0">
        <v-card max-width="400">
          <v-card-text>
            <v-alert v-if="profileError" type="error" class="mb-4" closable @click:close="profileError = ''">
              {{ profileError }}
            </v-alert>
            <v-alert v-if="profileSuccess" type="success" class="mb-4" closable @click:close="profileSuccess = ''">
              {{ profileSuccess }}
            </v-alert>
            <v-text-field v-model="firstName" label="Имя" />
            <v-text-field v-model="lastName" label="Фамилия" />
            <v-text-field :model-value="user.username" label="Username" disabled />
            <v-text-field :model-value="user.email" label="Email" disabled />
            <v-btn color="primary" @click="handleSaveProfile">Сохранить</v-btn>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Пароль -->
      <v-window-item value="1">
        <v-card max-width="400">
          <v-card-text>
            <v-alert v-if="passwordError" type="error" class="mb-4" closable @click:close="passwordError = ''">
              {{ passwordError }}
            </v-alert>
            <v-alert v-if="passwordSuccess" type="success" class="mb-4" closable @click:close="passwordSuccess = ''">
              {{ passwordSuccess }}
            </v-alert>
            <v-text-field v-model="currentPassword" label="Текущий пароль" type="password" />
            <v-text-field v-model="newPassword" label="Новый пароль" type="password" />
            <v-text-field v-model="confirmPassword" label="Подтвердите пароль" type="password" />
            <v-btn color="primary" @click="handleChangePassword">Сменить пароль</v-btn>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Настройки -->
      <v-window-item value="2">
        <v-card max-width="400">
          <v-card-text>
            <v-alert v-if="prefsError" type="error" class="mb-4" closable @click:close="prefsError = ''">
              {{ prefsError }}
            </v-alert>
            <v-alert v-if="prefsSuccess" type="success" class="mb-4" closable @click:close="prefsSuccess = ''">
              {{ prefsSuccess }}
            </v-alert>
            <v-select
              v-model="theme"
              :items="[
                { value: 'light', title: 'Светлая' },
                { value: 'dark', title: 'Темная' }
              ]"
              label="Тема"
            />
            <v-switch v-model="notificationsEnabled" label="Уведомления" color="primary" />
            <v-btn color="primary" @click="handleSavePreferences">Сохранить</v-btn>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Избранное -->
      <v-window-item value="3">
        <v-list v-if="favorites.length">
          <v-list-item v-for="item in favorites" :key="item.id" :title="item.title" :subtitle="`${item.category} · ${formatDate(item.publishedAt ?? item.createdAt)}`">
            <template #append>
              <v-btn icon="mdi-delete" variant="text" color="error" @click="removeFavorite(item.id)" />
            </template>
          </v-list-item>
        </v-list>
        <v-card v-else class="pa-8 text-center">
          <v-card-text>Нет избранных новостей</v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>
