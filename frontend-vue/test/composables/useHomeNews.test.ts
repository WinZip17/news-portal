import { describe, expect, it } from 'vitest';
import { hasNewsImage } from '@/composables/useHomeNews';
import { mockNewsItem } from '../fixtures/mocks';

describe('hasNewsImage', () => {
  it('returns true when imageUrl is set', () => {
    expect(hasNewsImage({ ...mockNewsItem, imageUrl: 'https://example.com/a.jpg' })).toBe(true);
  });

  it('returns false for empty or missing imageUrl', () => {
    expect(hasNewsImage({ ...mockNewsItem, imageUrl: '' })).toBe(false);
    expect(hasNewsImage({ ...mockNewsItem, imageUrl: undefined })).toBe(false);
    expect(hasNewsImage({ ...mockNewsItem, imageUrl: '   ' })).toBe(false);
  });

  it('returns false for category SVG placeholder', () => {
    expect(hasNewsImage({ ...mockNewsItem, imageUrl: 'data:image/svg+xml;base64,abc' })).toBe(false);
  });
});
