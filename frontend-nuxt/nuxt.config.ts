import Aura from '@primeuix/themes/aura';
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'canonical', href: 'https://short-news.ru/' },
      ],
      meta: [
        { name: 'author', content: 'News Portal' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },
        { name: 'theme-color', content: '#020420' },
        { name: 'msapplication-TileColor', content: '#020420' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://short-news.ru/' },
        { property: 'og:image', content: 'https://short-news.ru/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:site_name', content: 'Short News' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://short-news.ru/og-image.png' },
      ],
    },
  },

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
    css: {
      preprocessorMaxWorkers: true,
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false,
      cssMinify: true,
    },
  },
  compatibilityDate: '2026-07-24',
});
