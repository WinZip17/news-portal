import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '~/utils/getErrorMessage';

describe('getErrorMessage', () => {
  it('returns Error message', () => {
    expect(getErrorMessage(new Error('Invalid credentials'))).toBe('Invalid credentials');
  });

  it('returns fallback for non-Error values', () => {
    expect(getErrorMessage('oops')).toBe('Неизвестная ошибка');
    expect(getErrorMessage(null)).toBe('Неизвестная ошибка');
  });

  it('uses custom fallback message', () => {
    expect(getErrorMessage(undefined, 'Ошибка API')).toBe('Ошибка API');
  });
});
