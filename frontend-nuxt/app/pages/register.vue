<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <i class="pi pi-user-plus" style="font-size: 2.5rem; color: var(--p-primary-color)"></i>
        <h1>Регистрация</h1>
        <p>Создайте аккаунт для доступа ко всем функциям</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-field">
          <label for="firstName">Имя</label>
          <InputText
            id="firstName"
            v-model="firstName"
            placeholder="Иван"
            :invalid="!!errors.firstName"
          />
          <small v-if="errors.firstName" class="error-text">{{ errors.firstName }}</small>
        </div>
        <div class="form-field">
          <label for="lastName">Фамилия</label>
          <InputText
            id="lastName"
            v-model="lastName"
            placeholder="Иванов"
            :invalid="!!errors.lastName"
          />
          <small v-if="errors.lastName" class="error-text">{{ errors.lastName }}</small>
        </div>
        <div class="form-field">
          <label for="username">Имя пользователя</label>
          <InputText
            id="username"
            v-model="username"
            placeholder="ivan_ivanov"
            :invalid="!!errors.username"
          />
          <small v-if="errors.username" class="error-text">{{ errors.username }}</small>
        </div>

        <div class="form-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            :invalid="!!errors.email"
          />
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        </div>

        <div class="form-field">
          <label for="password">Пароль</label>
          <Password
            id="password"
            v-model="password"
            fluid
            placeholder="Минимум 8 символов"
            :invalid="!!errors.password"
            toggle-mask
          />
          <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
        </div>

        <div class="form-field">
          <label for="confirmPassword">Подтверждение пароля</label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Повторите пароль"
            :feedback="false"
            fluid
            :invalid="!!errors.confirmPassword"
            toggle-mask
          />
          <small v-if="errors.confirmPassword" class="error-text">
            {{ errors.confirmPassword }}
          </small>
        </div>

        <Message v-if="authError" severity="error" :closable="true" @close="authError = ''">
          {{ authError }}
        </Message>

        <Button
          type="submit"
          label="Зарегистрироваться"
          icon="pi pi-user-plus"
          severity="primary"
          :loading="authStore.isLoading"
          class="w-full"
        />
      </form>

      <div class="auth-footer">
        <p>
          Уже есть аккаунт?
          <NuxtLink to="/login" class="link">Войти</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

definePageMeta({
  middleware: 'guest',
});

const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errors = ref<Record<string, string>>({});
const authError = ref('');

function validateForm(): boolean {
  errors.value = {};

  if (username.value && (username.value.length < 3 || username.value.length > 30)) {
    errors.value.username = 'Имя пользователя должно быть от 3 до 30 символов';
  }

  if (!email.value) {
    errors.value.email = 'Email обязателен';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Некорректный email';
  }

  if (!password.value) {
    errors.value.password = 'Пароль обязателен';
  } else if (password.value.length < 8) {
    errors.value.password = 'Пароль должен быть минимум 8 символов';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    errors.value.password = 'Пароль должен содержать заглавные, строчные буквы и цифры';
  }

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Пароли не совпадают';
  }

  return Object.keys(errors.value).length === 0;
}

async function handleRegister() {
  if (!validateForm()) return;

  try {
    authError.value = '';
    await authStore.register({
      email: email.value,
      username: username.value,
      password: password.value,
      firstName: firstName.value || undefined,
      lastName: lastName.value || undefined,
    });

    router.push('/');
  } catch (error: unknown) {
    authError.value = getErrorMessage(error, 'Ошибка при регистрации');
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem 1rem;
}

.auth-card {
  background-color: var(--p-surface-card);
  border-radius: 1rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--p-surface-border);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 1rem 0 0.5rem;
}

.auth-header p {
  color: var(--p-text-muted-color);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--p-surface-border);
}

.auth-footer p {
  color: var(--p-text-muted-color);
}

.link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
