<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useHead } from '@unhead/vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const valid = ref(false);

const rules = {
  required: (v: string) => !!v || 'Обязательное поле',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Введите корректный email',
  minLength: (v: string) => v.length >= 6 || 'Минимум 6 символов',
  minLength8: (v: string) => v.length >= 8 || 'Минимум 8 символов',
  passwordMatch: (v: string) => v === password.value || 'Пароли не совпадают'
};

async function handleSubmit() {
  if (!valid.value) return;
  loading.value = true;
  error.value = '';
  try {
    await authStore.register({
      email: email.value,
      username: username.value,
      password: password.value
    });
    router.push('/login');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Ошибка регистрации';
  } finally {
    loading.value = false;
  }
}
useHead({ title: 'Регистрация' });
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center text-h4">Регистрация</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
              {{ error }}
            </v-alert>
            <v-form v-model="valid" @submit.prevent="handleSubmit">
              <v-text-field v-model="email" label="Email" type="email" :rules="[rules.required, rules.email]" prepend-inner-icon="mdi-email" />
              <v-text-field v-model="username" label="Имя пользователя" :rules="[rules.required, rules.minLength]" prepend-inner-icon="mdi-account" />
              <v-text-field v-model="password" label="Пароль" type="password" :rules="[rules.required, rules.minLength8]" prepend-inner-icon="mdi-lock" />
              <v-text-field v-model="confirmPassword" label="Подтвердите пароль" type="password" :rules="[rules.required, rules.passwordMatch]" prepend-inner-icon="mdi-lock" />
              <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2"> Зарегистрироваться </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn variant="text" to="/login">Уже есть аккаунт? Войти</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
