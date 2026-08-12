<template>
  <div class="app-container">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toast position="bottom-right" />
      <ConfirmDialog />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const uiStore = useUIStore();

onMounted(async () => {
  uiStore.initTheme();
   await authStore.checkAuth();
});

useHead({
  style: [
    {
      innerHTML: `
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f8f9fa;
          color: #495057;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }
        .p-dark body, body:has(.p-dark) {
          background-color: #111827;
          color: #f9fafb;
        }
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
      `,
    },
  ],
});
</script>
