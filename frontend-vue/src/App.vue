<template>
  <v-app>
    <MainLayout>
      <RouterView />
    </MainLayout>
  </v-app>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
</script>
