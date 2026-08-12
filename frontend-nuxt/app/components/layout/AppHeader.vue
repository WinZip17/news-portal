<template>
  <header class="app-header">
    <div class="header-container">
      <NuxtLink to="/" class="logo">
        <i class="pi pi-globe" style="font-size: 1.5rem"></i>
        <span class="logo-text">Short News</span>
      </NuxtLink>

      <!-- Desktop Navigation + Framework Switcher -->
      <div class="header-nav-wrapper">
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

        <FrameworkSwitcher />
      </div>

      <div class="header-actions">
        <!-- Theme Toggle -->
        <Button
          :icon="uiStore.theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
          severity="secondary"
          text
          rounded
          aria-label="Переключить тему"
          @click="uiStore.toggleTheme()"
        />

        <!-- User Menu -->
        <template v-if="authStore.isAuthenticated">
          <Button
            icon="pi pi-user"
            aria-label="Профиль"
            severity="secondary"
            text
            rounded
            @click="navigateTo('/profile')"
          />
          <Button
            label="Выйти"
            aria-label="Выйти"
            icon="pi pi-sign-out"
            severity="danger"
            text
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <Button
            label="Войти"
            aria-label="Войти"
            icon="pi pi-sign-in"
            severity="primary"
            text
            @click="navigateTo('/login')"
          />
          <Button
            label="Регистрация"
            aria-label="Регистрация"
            icon="pi pi-user-plus"
            severity="secondary"
            @click="navigateTo('/register')"
          />
        </template>

        <!-- Mobile Menu Toggle -->
        <Button
          icon="pi pi-bars"
          aria-label="Переключить меню"
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
      <div class="mobile-switcher">
        <FrameworkSwitcher />
      </div>

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
import FrameworkSwitcher from '~/components/common/FrameworkSwitcher.vue';

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();

const mobileMenuOpen = ref(false);

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
  background-color: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
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
  color: var(--p-primary-color);
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-text {
  background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-hover-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Обёртка для навигации и свитчера */
.header-nav-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.nav-desktop {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--p-text-color);
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--p-surface-hover);
}

.nav-link--active {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
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
  background-color: var(--p-surface-card);
  border-top: 1px solid var(--p-surface-border);
}

.mobile-switcher {
  padding: 0.5rem 0.75rem 0.75rem;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--p-text-color);
  border-radius: 6px;
  transition: background-color 0.2s;
}

.mobile-link:hover {
  background-color: var(--p-surface-hover);
}

@media (max-width: 768px) {
  .header-nav-wrapper {
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
