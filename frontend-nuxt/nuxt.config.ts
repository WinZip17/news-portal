// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@primevue/nuxt-module'],

  primevue: {
    options: {
      theme: 'none',
      ripple: true,
    },
    components: {
      include: [
        'Button',
        'InputText',
        'Password',
        'Checkbox',
        'Dropdown',
        'Dialog',
        'DataTable',
        'Column',
        'Tag',
        'SelectButton',
        'Card',
        'Avatar',
        'Toast',
        'ConfirmDialog',
        'ProgressSpinner',
        'Message',
        'Paginator',
        'ToggleSwitch',
        'TabView',
        'TabPanel',
        'InputNumber',
        'Divider',
      ],
    },
  },

  css: [
    'primeicons/primeicons.css',
    '@/app/assets/styles/main.css',
    '@/app/assets/styles/themes.css',
  ],

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001',
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
    compileTemplate: true,
    resetAsyncDataToUndefined: true,
    templateUtils: true,
    relativeWatchPaths: true,
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
    },
  },
});
