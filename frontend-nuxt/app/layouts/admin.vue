<template>
  <div class="layout-admin">
    <AppHeader />
    <div class="admin-container">
      <AdminSidebar />
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue';

definePageMeta({
  middleware: 'auth',
});
</script>

<style scoped>
.layout-admin {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-container {
  display: flex;
  flex: 1;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background-color: var(--p-surface-ground);
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }

  .admin-content {
    padding: 1rem;
  }
}
</style>
