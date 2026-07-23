import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { createHash } from 'crypto';
import { News } from '../../entities';
import { normalizeUrl } from '../../utils/normalizeUrl';

type CheckDuplicateInput = {
  title: string;
  sourceUrl?: string;
  content?: string;
  summary?: string;
  windowDays?: number;
  recentLimit?: number;
};

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async checkDuplicate(
    input: CheckDuplicateInput | string,
    sourceUrl?: string,
  ): Promise<{
    isDuplicate: boolean;
    reason?: string;
    originalNews?: News;
  }> {
    const payload: CheckDuplicateInput = typeof input === 'string' ? { title: input, sourceUrl } : input;

    const title = this.normalizeTitle(payload.title);
    const normalizedSourceUrl = payload.sourceUrl ? normalizeUrl(payload.sourceUrl) : undefined;
    const windowDays = payload.windowDays ?? 60;
    const recentLimit = payload.recentLimit ?? 1000;

    if (!title) {
      return { isDuplicate: false };
    }

    // Берём последние новости, чтобы:
    // 1) проверять title similarity
    // 2) искать дубли по sourceUrl даже если URL был немного изменён
    const recentNews = await this.getRecentNews(windowDays, recentLimit);

    // 1) ЖЁСТКАЯ проверка по URL источника
    if (normalizedSourceUrl) {
      const byUrl = recentNews.find((news) => {
        if (!news.sourceUrl) return false;
        return normalizeUrl(news.sourceUrl) === normalizedSourceUrl;
      });

      if (byUrl) {
        return {
          isDuplicate: true,
          reason: 'Совпадение по sourceUrl',
          originalNews: byUrl,
        };
      }

      // Дополнительно: если в БД уже есть точная строка sourceUrl
      const exactRawUrl = await this.newsRepository.findOne({
        where: { sourceUrl: payload.sourceUrl },
      });

      if (exactRawUrl) {
        return {
          isDuplicate: true,
          reason: 'Точное совпадение sourceUrl',
          originalNews: exactRawUrl,
        };
      }
    }

    // 2) ТОЧНОЕ совпадение title после нормализации
    const exactTitleMatch = recentNews.find((news) => {
      const existingTitle = this.normalizeTitle(news.title);
      return existingTitle === title;
    });

    if (exactTitleMatch) {
      return {
        isDuplicate: true,
        reason: 'Точное совпадение заголовка',
        originalNews: exactTitleMatch,
      };
    }

    // 3) Похожие заголовки
    const similarMatch = this.findSimilarTitleMatch(title, recentNews);

    if (similarMatch) {
      return {
        isDuplicate: true,
        reason: `Похожий заголовок (${Math.round(similarMatch.score * 100)}%)`,
        originalNews: similarMatch.news,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Берём последние новости для анализа
   */
  private async getRecentNews(windowDays: number, limit: number): Promise<News[]> {
    const date = new Date();
    date.setDate(date.getDate() - windowDays);

    return this.newsRepository.find({
      where: {
        createdAt: MoreThanOrEqual(date),
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Нормализация заголовка:
   * - lower case
   * - ё -> е
   * - убрать пунктуацию
   * - схлопнуть пробелы
   */
  private normalizeTitle(title: string): string {
    return (title || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Поиск похожего заголовка
   */
  private findSimilarTitleMatch(title: string, newsList: News[]): { news: News; score: number } | null {
    let bestMatch: { news: News; score: number } | null = null;

    for (const news of newsList) {
      const score = this.calculateTitleSimilarity(title, news.title);

      if (score >= 0.78) {
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { news, score };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Схожесть заголовков:
   * комбинируем Jaccard по словам и Levenshtein similarity
   */
  private calculateTitleSimilarity(a: string, b: string): number {
    const na = this.normalizeTitle(a);
    const nb = this.normalizeTitle(b);

    if (!na || !nb) return 0;
    if (na === nb) return 1;

    const tokenScore = this.jaccardSimilarity(this.tokenize(na), this.tokenize(nb));

    const levScore = this.levenshteinSimilarity(na, nb);

    // Итоговая оценка
    return tokenScore * 0.65 + levScore * 0.35;
  }

  private tokenize(text: string): string[] {
    const stopWords = new Set([
      'и',
      'в',
      'во',
      'на',
      'с',
      'со',
      'к',
      'ко',
      'по',
      'за',
      'о',
      'об',
      'от',
      'для',
      'из',
      'у',
      'при',
      'как',
      'что',
      'это',
      'а',
      'но',
      'или',
      'же',
      'the',
      'a',
      'an',
      'to',
      'of',
      'in',
      'on',
      'for',
      'and',
      'or',
    ]);

    return text
      .split(' ')
      .map((w) => w.trim())
      .filter((w) => w.length > 2)
      .filter((w) => !stopWords.has(w));
  }

  private jaccardSimilarity(a: string[], b: string[]): number {
    if (!a.length || !b.length) return 0;

    const setA = new Set(a);
    const setB = new Set(b);

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Levenshtein similarity: 1 - distance/maxLen
   */
  private levenshteinSimilarity(a: string, b: string): number {
    const dist = this.levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 1 : 1 - dist / maxLen;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;

        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Если захочешь потом сравнивать контент:
   * можно использовать хэш нормализованного текста.
   */
  private generateFingerprint(text: string): string {
    return createHash('sha256')
      .update(
        (text || '')
          .toLowerCase()
          .replace(/<[^>]*>/g, ' ')
          .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .digest('hex');
  }
}
