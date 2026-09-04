import { describe, expect, it } from '@jest/globals';
import { hasRealImageUrl, isPlaceholderImageUrl, PLACEHOLDER_IMAGE_PREFIX } from './news-image.utils';

describe('news-image.utils', () => {
  it('detects category SVG placeholder', () => {
    const placeholder = `${PLACEHOLDER_IMAGE_PREFIX}PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmci`;
    expect(isPlaceholderImageUrl(placeholder)).toBe(true);
    expect(hasRealImageUrl(placeholder)).toBe(false);
  });

  it('accepts regular http image url', () => {
    expect(hasRealImageUrl('https://example.com/news.jpg')).toBe(true);
    expect(isPlaceholderImageUrl('https://example.com/news.jpg')).toBe(false);
  });

  it('rejects empty image url', () => {
    expect(hasRealImageUrl('')).toBe(false);
    expect(hasRealImageUrl(null)).toBe(false);
    expect(hasRealImageUrl(undefined)).toBe(false);
    expect(hasRealImageUrl('   ')).toBe(false);
  });
});
