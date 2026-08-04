<template>
  <div class="users-page">
    <h1 class="page-title">Управление пользователями</h1>

    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else>
      <DataTable
        :value="usersList"
        :paginator="true"
        :rows="10"
        :rows-per-page-options="[10, 20, 50]"
        paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        current-page-report-template="Показано с {first} по {last} из {totalRecords}"
        data-key="id"
      >
        <Column header="Пользователь">
          <template #body="{ data }">
            <div class="user-cell">
              <Avatar
                :label="getInitials(data)"
                style="background-color: var(--p-primary-color); color: white"
                shape="circle"
                size="large"
              />
              <div>
                <p class="user-name">{{ data.firstName }} {{ data.lastName }}</p>
                <p class="user-email">{{ data.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="username" header="Username" :sortable="true" />

        <Column field="role" header="Роль" :sortable="true">
          <template #body="{ data }">
            <Tag :severity="getRoleSeverity(data.role)" :value="getRoleLabel(data.role)" />
          </template>
        </Column>

        <Column field="isActive" header="Активен">
          <template #body="{ data }">
            <i
              :class="data.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'"
              :style="{ color: data.isActive ? '#22C55E' : '#EF4444', fontSize: '1.25rem' }"
            ></i>
          </template>
        </Column>

        <Column field="createdAt" header="Дата регистрации" :sortable="true">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column header="Действия" style="width: 200px">
          <template #body="{ data }">
            <div class="actions-cell">
              <Button
                v-tooltip.top="'Редактировать'"
                icon="pi pi-pencil"
                severity="info"
                text
                rounded
                :disabled="!canEditUser(data)"
                @click="editUser(data)"
              />
              <Button
                v-tooltip.top="'Удалить'"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                :disabled="!canDeleteUser(data)"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Диалог редактирования -->
    <Dialog
      v-model:visible="editDialog"
      header="Редактирование пользователя"
      :style="{ width: '500px' }"
      :modal="true"
      :pt="{
        content: { class: 'p-0' },
        footer: { class: 'p-0' },
      }"
    >
      <template v-if="editingUser">
        <form class="edit-form" @submit.prevent="saveUser">
          <div class="form-field">
            <label>Email</label>
            <InputText v-model="editForm.email" class="w-full" />
          </div>

          <div class="form-field">
            <label>Username</label>
            <InputText v-model="editForm.username" class="w-full" />
          </div>

          <div class="form-field">
            <label>Имя</label>
            <InputText v-model="editForm.firstName" />
          </div>
          <div class="form-field">
            <label>Фамилия</label>
            <InputText v-model="editForm.lastName" />
          </div>

          <div class="form-field">
            <label>Роль</label>
            <Dropdown
              v-model="editForm.role"
              :options="availableRoles"
              option-label="label"
              option-value="value"
              class="w-full"
              :disabled="!authStore.isSuperAdmin"
            />
          </div>

          <div class="form-field">
            <label>Активен</label>
            <ToggleSwitch v-model="editForm.isActive" />
          </div>

          <Message v-if="editError" severity="error" :closable="false">
            {{ editError }}
          </Message>

          <div class="form-actions">
            <Button
              label="Отмена"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="editDialog = false"
            />
            <Button
              type="submit"
              label="Сохранить"
              icon="pi pi-check"
              severity="primary"
              :loading="isSaving"
            />
          </div>
        </form>
      </template>
    </Dialog>

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import type { UserResponse, UpdateUserDto, UserRole } from '~/types';
import { useAuthService } from '~/services/auth.service.ts';
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const authStore = useAuthStore();
const authService = useAuthService();
const confirm = useConfirm();
const toast = useToast();

const users = ref<UserResponse[]>([]);
const isLoading = ref(false);
const editDialog = ref(false);
const editingUser = ref<UserResponse | null>(null);
const editError = ref('');
const isSaving = ref(false);

const editForm = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  role: '' as UserRole,
  isActive: true,
});

const availableRoles = [
  { label: 'Пользователь', value: 'user' },
  { label: 'Модератор', value: 'moderator' },
  { label: 'Администратор', value: 'admin' },
  { label: 'Супер-админ', value: 'super_admin' },
];

// Передаём копию массива, чтобы DataTable не мутировал исходный
const usersList = computed(() => [...users.value]);

if (!authStore.isAdmin) {
  navigateTo('/');
}

onMounted(() => {
  loadUsers();
});

async function loadUsers() {
  try {
    isLoading.value = true;
    const usersData = await authService.getUsers();
    users.value = usersData.data;
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: getErrorMessage(error, 'Не удалось загрузить пользователей'),
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
}

function getInitials(user: UserResponse): string {
  const first = user.firstName?.[0] || user.username[0];
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase();
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    user: 'Пользователь',
    moderator: 'Модератор',
    admin: 'Админ',
    super_admin: 'Супер-админ',
  };
  return labels[role] || role;
}

function getRoleSeverity(role: string): string {
  const severities: Record<string, string> = {
    user: 'info',
    moderator: 'warning',
    admin: 'danger',
    super_admin: 'danger',
  };
  return severities[role] || 'info';
}

function canEditUser(user: UserResponse): boolean {
  if (authStore.isSuperAdmin) return true;
  if (authStore.isAdmin && (user.role === 'user' || user.role === 'moderator')) {
    return true;
  }
  return false;
}

function canDeleteUser(user: UserResponse): boolean {
  if (user.id === authStore.user?.id) return false;
  if (authStore.isSuperAdmin && user.role !== 'admin' && user.role !== 'super_admin') {
    return true;
  }
  return false;
}

function editUser(user: UserResponse) {
  editingUser.value = user;
  editForm.value = {
    email: user.email,
    username: user.username,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role as UserRole,
    isActive: user.isActive,
  };
  editDialog.value = true;
  editError.value = '';
}

async function saveUser() {
  if (!editingUser.value) return;

  try {
    isSaving.value = true;
    editError.value = '';

    const updateData: UpdateUserDto = {
      email: editForm.value.email,
      username: editForm.value.username,
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      role: editForm.value.role,
      isActive: editForm.value.isActive,
    };

    await authService.updateUser(editingUser.value.id, updateData);

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Пользователь обновлен',
      life: 3000,
    });

    editDialog.value = false;
    loadUsers();
  } catch (error: unknown) {
    editError.value = getErrorMessage(error, 'Ошибка при сохранении');
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(user: UserResponse) {
  confirm.require({
    message: `Вы уверены, что хотите удалить пользователя "${user.username}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await authService.deleteUser(user.id);
        toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Пользователь удален',
          life: 3000,
        });
        loadUsers();
      } catch (error: unknown) {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: getErrorMessage(error, 'Не удалось удалить пользователя'),
          life: 3000,
        });
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.users-page {
  max-width: 100%;
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  font-weight: 500;
  color: var(--p-text-color);
}

.user-email {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  padding-top: 0.5rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
