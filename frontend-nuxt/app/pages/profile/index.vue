<template>
  <div class="profile-page">
    <h1 class="page-title">Личный кабинет</h1>

    <div v-if="authStore.isLoading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else-if="authStore.user" class="profile-content">
      <TabView>
        <TabPanel header="Профиль" value="profile">
          <div class="tab-content">
            <div class="profile-header">
              <Avatar
                :label="userInitials"
                size="xlarge"
                class="avatar-primary"
                shape="circle"
              />
              <div>
                <h2>{{ authStore.user.firstName }} {{ authStore.user.lastName }}</h2>
                <p>@{{ authStore.user.username }}</p>
                <span class="role-badge">{{ roleLabel }}</span>
              </div>
            </div>

            <form class="profile-form" @submit.prevent="updateProfile">
              <div class="form-grid">
                <div class="form-field">
                  <label>Email</label>
                  <InputText v-model="profileForm.email" disabled />
                </div>

                <div class="form-field">
                  <label>Имя пользователя</label>
                  <InputText v-model="profileForm.username" disabled />
                </div>

                <div class="form-field">
                  <label>Имя</label>
                  <InputText v-model="profileForm.firstName" placeholder="Введите имя" />
                </div>

                <div class="form-field">
                  <label>Фамилия</label>
                  <InputText v-model="profileForm.lastName" placeholder="Введите фамилию" />
                </div>
              </div>

              <Message v-if="profileError" severity="error">{{ profileError }}</Message>
              <Message v-if="profileSuccess" severity="success">{{ profileSuccess }}</Message>

              <Button
                type="submit"
                label="Сохранить изменения"
                icon="pi pi-save"
                severity="primary"
                :loading="isUpdating"
              />
            </form>
          </div>
        </TabPanel>

        <TabPanel header="Смена пароля" value="password">
          <div class="tab-content">
            <form class="password-form" @submit.prevent="changePassword">
              <div class="form-field">
                <label>Текущий пароль</label>
                <Password v-model="passwordForm.currentPassword" :feedback="false" toggle-mask />
              </div>

              <div class="form-field">
                <label>Новый пароль</label>
                <Password v-model="passwordForm.newPassword" toggle-mask />
              </div>

              <div class="form-field">
                <label>Подтвердите новый пароль</label>
                <Password v-model="passwordForm.confirmPassword" :feedback="false" toggle-mask />
              </div>

              <Message v-if="passwordError" severity="error">{{ passwordError }}</Message>
              <Message v-if="passwordSuccess" severity="success">{{ passwordSuccess }}</Message>

              <Button
                type="submit"
                label="Сменить пароль"
                icon="pi pi-lock"
                class="mt-3"
                severity="warning"
                :loading="isChangingPassword"
              />
            </form>
          </div>
        </TabPanel>

        <TabPanel header="Настройки" value="settings">
          <div class="tab-content">
            <div class="settings-section">
              <h3>Тема оформления</h3>
              <div class="theme-selector">
                <Button
                  label="Светлая"
                  icon="pi pi-sun"
                  :severity="uiStore.theme === 'light' ? 'primary' : 'secondary'"
                  @click="setTheme('light')"
                />
                <Button
                  label="Темная"
                  icon="pi pi-moon"
                  :severity="uiStore.theme === 'dark' ? 'primary' : 'secondary'"
                  @click="setTheme('dark')"
                />
              </div>
            </div>

            <Divider />

            <div class="settings-section">
              <h3>Уведомления</h3>
              <div class="toggle-group">
                <div class="toggle-item">
                  <label>Push-уведомления</label>
                  <ToggleSwitch v-model="preferencesForm.notificationsEnabled" />
                </div>
                <div class="toggle-item">
                  <label>Email-рассылка</label>
                  <ToggleSwitch v-model="preferencesForm.emailNotifications" />
                </div>
              </div>
              <Button
                label="Сохранить настройки"
                icon="pi pi-save"
                severity="primary"
                class="mt-3"
                @click="savePreferences"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Избранное" value="favorites">
          <div class="tab-content">
            <div v-if="favoritesLoading" class="loading-container">
              <ProgressSpinner />
            </div>

            <div v-else-if="favorites.length === 0" class="empty-state">
              <i class="pi pi-star icon-empty-md"></i>
              <p>У вас пока нет избранных новостей</p>
            </div>

            <div v-else class="favorites-grid">
              <NewsCard
                v-for="item in favorites"
                :key="item.id"
                :news="item"
                @click="openNewsDetail(item.id)"
                @favorite="removeFromFavorites(item.id)"
              />
            </div>
          </div>
        </TabPanel>
      </TabView>

      <NewsDetailModal
        v-model:visible="detailModalVisible"
        :news="selectedNews"
        @favorite="handleFavoriteChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, UserPreferences } from '~/types';
import { useAuthService } from '~/services/auth.service.ts';
import { useNewsService } from '~/services/news.service.ts';
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const uiStore = useUIStore();
const newsStore = useNewsStore();
const authService = useAuthService();
const newsService = useNewsService();

const isUpdating = ref(false);
const isChangingPassword = ref(false);
const profileError = ref('');
const profileSuccess = ref('');
const passwordError = ref('');
const passwordSuccess = ref('');
const detailModalVisible = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const favoritesLoading = ref(false);

const profileForm = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const preferencesForm = ref<Partial<UserPreferences>>({
  notificationsEnabled: true,
  emailNotifications: true,
});

const favorites = ref<NewsItem[]>([]);

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  const first = authStore.user.firstName?.[0] || authStore.user.username[0];
  const last = authStore.user.lastName?.[0] || '';
  return (first + last).toUpperCase();
});

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    user: 'Пользователь',
    moderator: 'Модератор',
    admin: 'Администратор',
    super_admin: 'Супер-админ',
  };
  return roles[authStore.user?.role || 'user'];
});

onMounted(() => {
  if (authStore.user) {
    profileForm.value = {
      email: authStore.user.email,
      username: authStore.user.username,
      firstName: authStore.user.firstName || '',
      lastName: authStore.user.lastName || '',
    };
    preferencesForm.value = { ...authStore.user.preferences };
    loadFavorites();
  }
});

async function updateProfile() {
  try {
    isUpdating.value = true;
    profileError.value = '';
    profileSuccess.value = '';

    await authService.updateProfile({
      firstName: profileForm.value.firstName || undefined,
      lastName: profileForm.value.lastName || undefined,
    });

    profileSuccess.value = 'Профиль успешно обновлен';
    await authStore.checkAuth();
  } catch (error: unknown) {
    profileError.value = getErrorMessage(error, 'Ошибка при обновлении профиля');
  } finally {
    isUpdating.value = false;
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Пароли не совпадают';
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Пароль должен быть минимум 8 символов';
    return;
  }

  try {
    isChangingPassword.value = true;
    passwordError.value = '';
    passwordSuccess.value = '';

    await authService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    passwordSuccess.value = 'Пароль успешно изменен';
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: unknown) {
    passwordError.value = getErrorMessage(error, 'Ошибка при смене пароля');
  } finally {
    isChangingPassword.value = false;
  }
}

function setTheme(theme: 'light' | 'dark') {
  authStore.sendSaveTheme(theme);
  uiStore.setTheme(theme);
}

async function savePreferences() {
  try {
    await authService.updatePreferences(preferencesForm.value);
    await authStore.checkAuth();
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

async function loadFavorites() {
  try {
    favoritesLoading.value = true;
    const favoritesData = await newsService.getFavorites();
    favorites.value = favoritesData.data;
  } catch (error) {
    console.error('Error loading favorites:', error);
  } finally {
    favoritesLoading.value = false;
  }
}

function openNewsDetail(id: string) {
  selectedNews.value = favorites.value.find((n) => n.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}

async function removeFromFavorites(id: string) {
  await newsStore.toggleFavorite(id);
  favorites.value = favorites.value.filter((n) => n.id !== id);
}

function handleFavoriteChange() {
  loadFavorites();
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin-bottom: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.profile-content {
  background-color: var(--p-surface-card);
  border-radius: 1rem;
  border: 1px solid var(--p-surface-border);
  overflow: hidden;
}

.tab-content {
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.profile-header h2 {
  color: var(--p-text-color);
  margin-bottom: 0.25rem;
}

.profile-header p {
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
}

.role-badge {
  background-color: var(--p-primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.profile-form,
.password-form {
  max-width: 500px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h3 {
  color: var(--p-text-color);
  margin-bottom: 1rem;
}

.theme-selector {
  display: flex;
  gap: 0.5rem;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-item label {
  color: var(--p-text-color);
  font-weight: 500;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-muted-color);
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

.mt-3 {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .tab-content {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
