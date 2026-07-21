import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual, FindOperator } from 'typeorm';
import { News } from '../../entities';
import { normalizeUrl } from '../../utils/normalizeUrl';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  /**
   * Проверка на дубликат с использованием нескольких стратегий
   */
  async checkDuplicate(
    title: string,
    sourceUrl?: string,
  ): Promise<{
    isDuplicate: boolean;
    reason?: string;
    originalNews?: News;
  }> {
    // 1. Точное совпадение заголовка
    const exactMatch = await this.findExactMatch(title);
    if (exactMatch) {
      return {
        isDuplicate: true,
        reason: 'Точное совпадение заголовка',
        originalNews: exactMatch,
      };
    }

    // 2. Частичное совпадение заголовка (90%+)
    const partialMatch = await this.findPartialMatch(title);
    if (partialMatch) {
      return {
        isDuplicate: true,
        reason: 'Частичное совпадение заголовка (>90%)',
        originalNews: partialMatch,
      };
    }

    // 3. Совпадение по ссылке на источник
    if (sourceUrl) {
      const url = normalizeUrl(sourceUrl);
      const allNews = await this.newsRepository.find({
        where: { sourceUrl: ILike(`%${url}%`) },
        take: 5,
      });
      if (allNews.length > 0) {
        return { isDuplicate: true, reason: 'Совпадение по ссылке на источник' };
      }
    }
    return { isDuplicate: false };
  }

  /**
   * Точное совпадение заголовка
   */
  private async findExactMatch(title: string): Promise<News | null> {
    return this.newsRepository.findOne({
      where: {
        title: ILike(title.trim()),
        createdAt: this.getRecentDateFilter(),
      },
    });
  }

  /**
   * Частичное совпадение (первые 70% заголовка)
   */
  private async findPartialMatch(title: string): Promise<News | null> {
    const partialTitle = title.substring(0, Math.floor(title.length * 0.7));

    const matches = await this.newsRepository.find({
      where: {
        title: ILike(`%${partialTitle}%`),
        createdAt: this.getRecentDateFilter(),
      },
      take: 5,
    });

    // Проверяем схожесть
    for (const match of matches) {
      const similarity = this.calculateSimilarity(title, match.title);
      if (similarity > 0.7) {
        return match;
      }
    }

    return null;
  }

  /**
   * Расчет схожести строк (коэффициент Жаккара)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Фильтр по дате (последние 7 дней)
   */
  private getRecentDateFilter(): FindOperator<Date> {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return MoreThanOrEqual(date);
  }
}
