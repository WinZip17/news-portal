import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import { createVuetify } from 'vuetify';

import { darkTheme, lightTheme } from './theme';
import { ThemeName } from '@/constants/theme';

export function createAppVuetify() {
  return createVuetify({
    theme: {
      defaultTheme: ThemeName.Light,
      themes: {
        [ThemeName.Light]: lightTheme,
        [ThemeName.Dark]: darkTheme
      }
    }
  });
}
