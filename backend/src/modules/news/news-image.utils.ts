/** SVG-заглушки категорий из AiService.generateImageUrl */
export const PLACEHOLDER_IMAGE_PREFIX = 'data:image/svg+xml;base64,';

export function isPlaceholderImageUrl(imageUrl?: string | null): boolean {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return false;
  }

  return trimmed.startsWith(PLACEHOLDER_IMAGE_PREFIX);
}

export function hasRealImageUrl(imageUrl?: string | null): boolean {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return false;
  }

  return !isPlaceholderImageUrl(trimmed);
}

export const HAS_REAL_IMAGE_SQL =
  "news.imageUrl IS NOT NULL AND TRIM(news.imageUrl) <> '' AND news.imageUrl NOT LIKE :placeholderPrefix";

export const NO_REAL_IMAGE_SQL =
  "(news.imageUrl IS NULL OR TRIM(news.imageUrl) = '' OR news.imageUrl LIKE :placeholderPrefix)";

export const PLACEHOLDER_LIKE_PATTERN = `${PLACEHOLDER_IMAGE_PREFIX}%`;
