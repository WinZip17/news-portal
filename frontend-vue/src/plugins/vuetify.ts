import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import { darkTheme, lightTheme } from './theme';

export function createAppVuetify() {
  return createVuetify({
    theme: {
      defaultTheme: 'light',
      themes: {
        light: lightTheme,
        dark: darkTheme
      }
    }
  });
}
