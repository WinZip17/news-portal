import { describe, expect, it } from '@jest/globals';
import { getSourceTextLength, hasSufficientSourceText, isAiRewriteRefusal, isValidRewriteDraft } from './ai-rewrite.validation';

describe('ai-rewrite.validation', () => {
  describe('hasSufficientSourceText', () => {
    it('returns false when content and summary are too short', () => {
      expect(
        hasSufficientSourceText({
          content: '<p>Коротко</p>',
          summary: 'Тоже мало',
        }),
      ).toBe(false);
    });

    it('returns true when summary is long enough', () => {
      const summary = 'А'.repeat(120);
      expect(hasSufficientSourceText({ content: '', summary })).toBe(true);
      expect(getSourceTextLength({ content: '', summary })).toBe(120);
    });
  });

  describe('isAiRewriteRefusal', () => {
    it('detects AI refusal about missing source text', () => {
      expect(
        isAiRewriteRefusal({
          title: 'Рерайт невозможен: отсутствует исходный текст',
          summary: 'Не удалось создать рерайт из-за отсутствия оригинальной статьи.',
          content:
            '<p>В запросе не был передан текст новости. Для выполнения качественного рерайта необходимо предоставить оригинальный материал.</p>',
          tags: ['ошибка', 'недостаточно данных'],
        }),
      ).toBe(true);
    });

    it('allows normal rewritten article', () => {
      expect(
        isAiRewriteRefusal({
          title: 'Неизвестный расстрелял военнослужащего в Энгельсе',
          summary: 'В Энгельсе произошло нападение на военнослужащего.',
          content: '<p>По данным следствия, инцидент произошел утром. Пострадавший доставлен в больницу.</p>',
          tags: ['происшествие', 'саратовская область'],
        }),
      ).toBe(false);
    });
  });

  describe('isValidRewriteDraft', () => {
    it('rejects refusal even if content is long enough', () => {
      expect(
        isValidRewriteDraft({
          title: 'Рерайт невозможен: отсутствует исходный текст',
          summary: 'Не удалось создать рерайт.',
          content: '<p>'.concat('Текст '.repeat(30), '</p>'),
        }),
      ).toBe(false);
    });

    it('rejects too short content', () => {
      expect(
        isValidRewriteDraft({
          title: 'Заголовок новости',
          summary: 'Кратко',
          content: '<p>Слишком коротко</p>',
        }),
      ).toBe(false);
    });
  });
});
