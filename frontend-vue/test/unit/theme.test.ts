import { describe, expect, it } from 'vitest';
import { darkTheme } from '@/plugins/theme';
import { watchDark } from '@/constants/theme';

describe('Vuetify dark theme', () => {
  it('uses standard Material palette for non-home pages', () => {
    expect(darkTheme.dark).toBe(true);
    expect(darkTheme.colors?.background).toBe('#121212');
    expect(darkTheme.colors?.surface).toBe('#1E1E1E');
    expect(darkTheme.colors?.primary).toBe('#90CAF9');
  });
});

describe('watchDark palette (newspaper home only)', () => {
  it('defines matte LCD colors for .newspaper-layout--watch', () => {
    expect(watchDark.background).toBe('#0d0d0d');
    expect(watchDark.onBackground).toBe('#c4c4c4');
    expect(watchDark.accent).toBe('#c8c8c8');
  });
});
