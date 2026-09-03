import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { defineConfig, configDefaults, type Plugin } from 'vitest/config';

const rootDir = fileURLToPath(new URL('./', import.meta.url));

function stubCss(): Plugin {
  return {
    name: 'stub-css',
    enforce: 'pre',
    transform(_code, id) {
      if (/\.(css|scss|sass)(\?.*)?$/.test(id)) {
        return { code: 'export default {}', map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    stubCss(),
    vue(),
    vuetify({
      autoImport: true,
      styles: 'none',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@api': path.resolve(rootDir, './src/api'),
      '@components': path.resolve(rootDir, './src/components'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@services': path.resolve(rootDir, './src/services'),
      '@store': path.resolve(rootDir, './src/store'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@types': path.resolve(rootDir, './src/types'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: rootDir,
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },
});
