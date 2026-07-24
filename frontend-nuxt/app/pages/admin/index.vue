<template>
  <div class="admin-dashboard">
    <h1 class="page-title">Админ-панель</h1>

    <div v-if="authStore.isModerator" class="dashboard-grid">
      <NuxtLink to="/admin/moderation" class="dashboard-card">
        <i class="pi pi-check-circle" style="font-size: 2.5rem; color: var(--primary-color)"></i>
        <h3>Модерация</h3>
        <p>Управление новостями: подтверждение, отклонение, архивирование</p>
        <span class="card-link"> Перейти <i class="pi pi-arrow-right"></i> </span>
      </NuxtLink>

      <NuxtLink v-if="authStore.isAdmin" to="/admin/users" class="dashboard-card">
        <i class="pi pi-users" style="font-size: 2.5rem; color: #f59e0b"></i>
        <h3>Пользователи</h3>
        <p>Управление пользователями: редактирование, удаление, смена ролей</p>
        <span class="card-link"> Перейти <i class="pi pi-arrow-right"></i> </span>
      </NuxtLink>

      <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/ai-generate" class="dashboard-card">
        <i class="pi pi-bolt" style="font-size: 2.5rem; color: #8b5cf6"></i>
        <h3>AI Генерация</h3>
        <p>Генерация новостей с помощью искусственного интеллекта</p>
        <span class="card-link"> Перейти <i class="pi pi-arrow-right"></i> </span>
      </NuxtLink>

      <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/news" class="dashboard-card">
        <i class="pi pi-file" style="font-size: 2.5rem; color: #22c55e"></i>
        <h3>Все новости</h3>
        <p>Полное управление новостями: создание, редактирование, удаление</p>
        <span class="card-link"> Перейти <i class="pi pi-arrow-right"></i> </span>
      </NuxtLink>
    </div>

    <div v-else class="access-denied">
      <Message severity="error"> У вас нет доступа к админ-панели </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import Message from 'primevue/message';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const authStore = useAuthStore();
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background-color: var(--surface-card);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid var(--surface-border);
  text-decoration: none;
  transition: all var(--transition-duration);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.dashboard-card h3 {
  color: var(--text-color);
  font-size: 1.25rem;
}

.dashboard-card p {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  flex: 1;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.875rem;
}

.access-denied {
  max-width: 500px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
