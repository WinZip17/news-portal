<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import NewsManagement from '@/pages/admin/NewsManagement.vue';
import UsersManagement from '@/pages/admin/UsersManagement.vue';
import SuperAdminPanel from '@/pages/admin/SuperAdminPanel.vue';

const router = useRouter();
const authStore = useAuthStore();
const { canAccessAdmin, isAuthenticated, user } = storeToRefs(authStore);

const tab = ref('news');
const isSuperAdmin = computed(() => user.value?.role === 'super_admin');

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  if (!canAccessAdmin.value) {
    router.push('/');
  }
});
</script>

<template>
  <div>
    <h2 class="text-h4 mb-4">Админ-панель</h2>

    <v-tabs v-model="tab">
      <v-tab value="news">
        <v-icon start>mdi-newspaper</v-icon>
        Управление новостями
      </v-tab>
      <v-tab value="users">
        <v-icon start>mdi-account-group</v-icon>
        Пользователи
      </v-tab>
      <v-tab v-if="isSuperAdmin" value="super">
        <v-icon start color="amber-darken-2">mdi-crown</v-icon>
        Панель суперадмина
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <v-window-item value="news">
        <NewsManagement />
      </v-window-item>
      <v-window-item value="users">
        <UsersManagement />
      </v-window-item>
      <v-window-item v-if="isSuperAdmin" value="super">
        <SuperAdminPanel />
      </v-window-item>
    </v-window>
  </div>
</template>
