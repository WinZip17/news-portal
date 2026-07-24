<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3 class="footer-title"><i class="pi pi-globe"></i> NewsHub</h3>
        <p class="footer-text">Современный новостной портал с AI-генерацией контента</p>
      </div>

      <div class="footer-section">
        <h4 class="footer-subtitle">Навигация</h4>
        <NuxtLink to="/news" class="footer-link">Новости</NuxtLink>
        <NuxtLink to="/login" class="footer-link">Вход</NuxtLink>
        <NuxtLink to="/register" class="footer-link">Регистрация</NuxtLink>
      </div>

      <div class="footer-section">
        <h4 class="footer-subtitle">Контакты</h4>
        <a href="mailto:info@newshub.ru" class="footer-link">
          <i class="pi pi-envelope"></i> info@newshub.ru
        </a>
        <a href="tel:+78001234567" class="footer-link">
          <i class="pi pi-phone"></i> 8 (800) 123-45-67
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} NewsHub. Все права защищены.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-title {
  color: var(--primary-color);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-subtitle {
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.footer-text {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.footer-link {
  color: var(--text-color-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color var(--transition-duration);
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid var(--surface-border);
  padding: 1.5rem;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-title {
    justify-content: center;
  }

  .footer-link {
    justify-content: center;
  }
}
</style>
