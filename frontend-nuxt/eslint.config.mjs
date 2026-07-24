// eslint.config.mjs
import {createConfigForNuxt} from '@nuxt/eslint-config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default createConfigForNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
  .append({
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Отключаем правила ESLint, конфликтующие с Prettier
      ...eslintConfigPrettier.rules,
      // Включаем Prettier как правило ESLint
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
          fileInfoOptions: {
            withNodeModules: false,
          },
        },
      ],
    },
  })
  .append({
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', '*.min.js', '*.map'],
  });
