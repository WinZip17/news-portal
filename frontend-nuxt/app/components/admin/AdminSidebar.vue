<!-- app/components/admin/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar">
    <nav class="sidebar-nav">
      <NuxtLink to="/admin" class="sidebar-link" exact-active-class="sidebar-link--active">
        <i class="pi pi-chart-bar"></i>
        <span>Дашборд</span>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isModerator"
        to="/admin/moderation"
        class="sidebar-link"
        active-class="sidebar-link--active"
      >
        <i class="pi pi-check-circle"></i>
        <span>Модерация</span>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isAdmin"
        to="/admin/users"
        class="sidebar-link"
        active-class="sidebar-link--active"
      >
        <i class="pi pi-users"></i>
        <span>Пользователи</span>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isSuperAdmin"
        to="/admin/news"
        class="sidebar-link"
        active-class="sidebar-link--active"
      >
        <i class="pi pi-file"></i>
        <span>Все новости</span>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isSuperAdmin"
        to="/admin/ai-generate"
        class="sidebar-link"
        active-class="sidebar-link--active"
      >
        <i class="pi pi-bolt"></i>
        <span>AI Генерация</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <NuxtLink to="/" class="sidebar-link">
        <i class="pi pi-arrow-left"></i>
        <span>На сайт</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  min-height: calc(100vh - 64px);
  background-color: var(--surface-card);
  border-right: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar-nav {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-duration);
  font-weight: 500;
}

.sidebar-link:hover {
  background-color: var(--surface-hover);
}

.sidebar-link--active {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--surface-border);
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .sidebar-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
