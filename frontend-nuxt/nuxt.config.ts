import Aura from '@primeuix/themes/aura';
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@primevue/nuxt-module'],

  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.p-dark',
        },
      },
      ripple: true,
    },
    components: {
      include: ['*'],
    },
  },

  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/main.css',
    '~/assets/styles/primevue-variables.css',
  ],

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001/api',
        changeOrigin: true,
        prependPath: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: '/api',
      appName: 'ShortNews',
      appVersion: '1.0.0',
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },

  // Настройки для Nuxt 4
  future: {
    compatibilityVersion: 4,
  },

  // Оптимизация SSR
  routeRules: {
    '/': { ssr: true },
    '/news': { ssr: true },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/profile/**': { ssr: false },
    '/admin/**': { ssr: false },
  },

  experimental: {
    sharedPrerenderData: false,
    defaults: {
      useAsyncData: {
        deep: true,
      },
    },
  },

  imports: {
    autoImport: true,
  },

  vite: {
    build: {
      target: 'esnext',
      cssCodeSplit: false,
    },
  },
  compatibilityDate: '2026-07-24',
});
