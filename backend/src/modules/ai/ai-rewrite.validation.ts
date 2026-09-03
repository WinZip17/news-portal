import { RssArticle } from '../../types';

export const MIN_SOURCE_TEXT_LENGTH = 80;
export const MIN_REWRITE_CONTENT_LENGTH = 50;

const ERROR_TEXT_PATTERNS: RegExp[] = [
  /рерайт\s+невозмож/i,
  /отсутствует\s+исходн/i,
  /не\s+удалось\s+создать/i,
  /недостаточно\s+данных/i,
  /не\s+был\s+передан\s+текст/i,
  /необходимо\s+предоставить/i,
  /контент\s+находится\s+в\s+процессе\s+генерации/i,
  /временно\s+недоступ/i,
  /provide\s+the\s+original/i,
  /source\s+text\s+(is\s+)?missing/i,
  /cannot\s+rewrite/i,
  /unable\s+to\s+rewrite/i,
];

const ERROR_TAG_PATTERNS: RegExp[] = [/^ошибка$/i, /^error$/i, /^недостаточно\s+данных$/i, /^insufficient\s+data$/i];

export interface RewriteDraft {
  title: string;
  summary: string;
  content: string;
  tags?: string[];
}

export function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSourceTextLength(article: Pick<RssArticle, 'content' | 'summary'>): number {
  const contentLen = stripHtml(article.content || '').length;
  const summaryLen = stripHtml(article.summary || '').length;
  return Math.max(contentLen, summaryLen);
}

export function hasSufficientSourceText(article: Pick<RssArticle, 'content' | 'summary'>): boolean {
  return getSourceTextLength(article) >= MIN_SOURCE_TEXT_LENGTH;
}

function hasErrorTag(tags?: string[]): boolean {
  if (!Array.isArray(tags) || tags.length === 0) {
    return false;
  }

  return tags.some((tag) => ERROR_TAG_PATTERNS.some((pattern) => pattern.test(tag.trim())));
}

function matchesErrorText(...parts: string[]): boolean {
  const combined = parts.map((part) => stripHtml(part)).join(' ');
  return ERROR_TEXT_PATTERNS.some((pattern) => pattern.test(combined));
}

export function isAiRewriteRefusal(draft: RewriteDraft): boolean {
  const title = (draft.title || '').trim();
  const summary = draft.summary || '';
  const content = draft.content || '';

  if (!title) {
    return true;
  }

  if (matchesErrorText(title, summary, content)) {
    return true;
  }

  if (hasErrorTag(draft.tags) && matchesErrorText(title, summary)) {
    return true;
  }

  return false;
}

export function isValidRewriteDraft(draft: RewriteDraft): boolean {
  if (isAiRewriteRefusal(draft)) {
    return false;
  }

  const contentText = stripHtml(draft.content);
  return contentText.length >= MIN_REWRITE_CONTENT_LENGTH;
}
