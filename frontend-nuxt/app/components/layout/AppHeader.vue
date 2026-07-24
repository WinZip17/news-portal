<template>
  <header class="app-header">
    <div class="header-container">
      <NuxtLink to="/" class="logo">
        <i class="pi pi-globe" style="font-size: 1.5rem"></i>
        <span class="logo-text">NewsHub</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="nav-desktop">
        <NuxtLink to="/news" class="nav-link" active-class="nav-link--active">
          <i class="pi pi-list"></i>
          <span>Новости</span>
        </NuxtLink>

        <NuxtLink
          v-if="authStore.isModerator"
          to="/admin"
          class="nav-link"
          active-class="nav-link--active"
        >
          <i class="pi pi-shield"></i>
          <span>Админка</span>
        </NuxtLink>
      </nav>

      <div class="header-actions">
        <!-- Theme Toggle -->
        <Button
          :icon="uiStore.theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
          severity="secondary"
          text
          rounded
          aria-label="Toggle theme"
          @click="uiStore.toggleTheme()"
        />

        <!-- User Menu -->
        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/profile" class="nav-link">
            <Avatar
              :label="userInitials"
              style="background-color: var(--primary-color); color: white"
              shape="circle"
            />
          </NuxtLink>
          <Button
            label="Выйти"
            icon="pi pi-sign-out"
            severity="danger"
            text
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <Button label="Войти" icon="pi pi-sign-in" severity="primary" text />
          </NuxtLink>
          <NuxtLink to="/register">
            <Button label="Регистрация" icon="pi pi-user-plus" severity="secondary" />
          </NuxtLink>
        </template>

        <!-- Mobile Menu Toggle -->
        <Button
          icon="pi pi-bars"
          severity="secondary"
          text
          rounded
          class="mobile-toggle"
          @click="mobileMenuOpen = !mobileMenuOpen"
        />
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <NuxtLink to="/news" class="mobile-link" @click="mobileMenuOpen = false">
        <i class="pi pi-list"></i> Новости
      </NuxtLink>
      <NuxtLink
        v-if="authStore.isModerator"
        to="/admin"
        class="mobile-link"
        @click="mobileMenuOpen = false"
      >
        <i class="pi pi-shield"></i> Админка
      </NuxtLink>
      <NuxtLink
        v-if="authStore.isAuthenticated"
        to="/profile"
        class="mobile-link"
        @click="mobileMenuOpen = false"
      >
        <i class="pi pi-user"></i> Профиль
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUIStore } from '@/app/stores/ui';

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();

const mobileMenuOpen = ref(false);

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  const first = authStore.user.firstName?.[0] || authStore.user.username[0];
  const last = authStore.user.lastName?.[0] || '';
  return (first + last).toUpperCase();
});

async function handleLogout() {
  await authStore.logout();
  router.push('/');
}

watch(
  () => router.currentRoute.value,
  () => {
    mobileMenuOpen.value = false;
  },
);
</script>

<style scoped>
.app-header {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-desktop {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  border-radius: var(--border-radius);
  transition: all var(--transition-duration);
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--surface-hover);
}

.nav-link--active {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-toggle {
  display: none;
}

.mobile-menu {
  display: none;
  padding: 0.5rem;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-duration);
}

.mobile-link:hover {
  background-color: var(--surface-hover);
}

@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
  }

  .header-actions > .nav-link,
  .header-actions > a > .p-button {
    display: none;
  }
}
</style>
