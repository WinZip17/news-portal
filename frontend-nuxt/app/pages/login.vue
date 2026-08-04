<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <i class="pi pi-sign-in" style="font-size: 2.5rem; color: var(--p-primary-color)"></i>
        <h1>Вход в аккаунт</h1>
        <p>Войдите, чтобы получить доступ ко всем возможностям</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            :invalid="!!errors.email"
            class="w-full"
          />
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        </div>

        <div class="form-field">
          <label for="password">Пароль</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Введите пароль"
            :feedback="false"
            fluid
            :invalid="!!errors.password"
            toggle-mask
            class="w-full"
          />
          <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
        </div>

        <div class="form-options">
          <div class="checkbox-field">
            <Checkbox v-model="rememberMe" :binary="true" input-id="remember" />
            <label for="remember">Запомнить меня</label>
          </div>
          <a href="#" class="forgot-link">Забыли пароль?</a>
        </div>

        <Message v-if="authError" severity="error" :closable="true" @close="authError = ''">
          {{ authError }}
        </Message>

        <Button
          type="submit"
          label="Войти"
          aria-label="Войти"
          icon="pi pi-sign-in"
          severity="primary"
          :loading="authStore.isLoading"
          class="w-full"
        />
      </form>

      <div class="auth-footer">
        <p>
          Нет аккаунта?
          <NuxtLink to="/register" class="link">Зарегистрироваться</NuxtLink>
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

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errors = ref<Record<string, string>>({});
const authError = ref('');

function validateForm(): boolean {
  errors.value = {};

  if (!email.value) {
    errors.value.email = 'Email обязателен';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Некорректный email';
  }

  if (!password.value) {
    errors.value.password = 'Пароль обязателен';
  } else if (password.value.length < 6) {
    errors.value.password = 'Пароль должен быть минимум 6 символов';
  }

  return Object.keys(errors.value).length === 0;
}

async function handleLogin() {
  if (!validateForm()) return;

  try {
    authError.value = '';
    await authStore.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    });

    // Перенаправляем на главную после входа
    router.push('/');
  } catch (error: unknown) {
    authError.value = getErrorMessage(error, 'Ошибка при входе');
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
  max-width: 450px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-field label {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  cursor: pointer;
}

.forgot-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-link:hover {
  text-decoration: underline;
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
}
</style>
