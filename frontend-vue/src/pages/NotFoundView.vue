<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-icon icon="mdi-alert-circle-outline" size="128" color="grey-lighten-1" class="mb-4" />
        <h1 class="text-h2 font-weight-bold mb-2">404</h1>
        <p class="text-h5 text-medium-emphasis mb-6">Страница не найдена</p>
        <div class="d-flex gap-2 justify-center">
          <v-btn color="primary" size="large" @click="router.push('/')">На главную</v-btn>
          <v-btn variant="outlined" size="large" @click="router.back()">Назад</v-btn>
          <v-btn variant="text" size="large" @click="router.push('/news')">К новостям</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
