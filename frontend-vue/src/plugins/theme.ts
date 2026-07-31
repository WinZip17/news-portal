import type { ThemeDefinition } from 'vuetify';

import { colors } from '@/constants/theme';

export const lightTheme: ThemeDefinition = {
  dark: false,

  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,

    background: colors.background,
    surface: colors.surface,

    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info
  }
};

export const darkTheme: ThemeDefinition = {
  dark: true,

  colors: {
    primary: '#90CAF9',

    secondary: '#BDBDBD',

    accent: '#448AFF',

    background: '#121212',

    surface: '#1E1E1E',

    success: '#66BB6A',

    warning: '#FFD54F',

    error: '#EF5350',

    info: '#42A5F5'
  }
};
