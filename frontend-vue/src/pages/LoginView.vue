<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const valid = ref(false);

const rules = {
  required: (v: string) => !!v || 'Обязательное поле',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Введите корректный email',
  minLength: (v: string) => v.length >= 6 || 'Минимум 6 символов'
};

async function handleSubmit() {
  if (!valid.value) return;
  loading.value = true;
  error.value = '';
  try {
    await authStore.login({ email: email.value, password: password.value });
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Ошибка входа';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-center text-h4">Вход</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
              {{ error }}
            </v-alert>
            <v-form v-model="valid" @submit.prevent="handleSubmit">
              <v-text-field v-model="email" label="Email" type="email" :rules="[rules.required, rules.email]" prepend-inner-icon="mdi-email" />
              <v-text-field v-model="password" label="Пароль" type="password" :rules="[rules.required, rules.minLength]" prepend-inner-icon="mdi-lock" />
              <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2"> Войти </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn variant="text" to="/register">Нет аккаунта? Зарегистрироваться</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
