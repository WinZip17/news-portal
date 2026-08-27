<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Страница не найдена</h1>
      <p>Извините, запрашиваемая страница не существует или была перемещена</p>

      <div class="not-found-actions">
        <NuxtLink to="/">
          <Button
            label="На главную"
            aria-label="На главную"
            icon="pi pi-home"
            severity="primary"
            size="large"
          />
        </NuxtLink>
        <Button
          label="Назад"
          icon="pi pi-arrow-left"
          severity="secondary"
          size="large"
          @click="goBack"
        />
      </div>

      <div class="not-found-links">
        <h3>Возможно, вас заинтересует:</h3>
        <div class="links-grid">
          <NuxtLink to="/news" class="quick-link">
            <i class="pi pi-list"></i> Все новости
          </NuxtLink>
          <NuxtLink to="/login" class="quick-link" aria-label="Войти">
            <i class="pi pi-sign-in"></i> Войти
          </NuxtLink>
          <NuxtLink to="/register" class="quick-link">
            <i class="pi pi-user-plus"></i> Регистрация
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

function goBack() {
  router.go(-1);
}

setResponseStatus(404);
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem 1rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-hover-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

.not-found-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
}

.not-found-content p {
  color: var(--p-text-muted-color);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.not-found-links {
  text-align: left;
  background-color: var(--p-surface-card);
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid var(--p-surface-border);
}

.not-found-links h3 {
  color: var(--p-text-color);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--p-surface-hover);
  border-radius: 6px;
  color: var(--p-text-color);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.quick-link:hover {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .not-found-content h1 {
    font-size: 1.5rem;
  }

  .not-found-actions {
    flex-direction: column;
  }
}
</style>
