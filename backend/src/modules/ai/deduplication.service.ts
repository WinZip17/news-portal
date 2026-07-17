import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual } from 'typeorm';
import { News, NewsStatus } from '../../entities/news.entity';

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
    async checkDuplicate(title: string, content?: string, source?: string): Promise<{
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

        // 2. Частичное совпадение заголовка (70%+)
        const partialMatch = await this.findPartialMatch(title);
        if (partialMatch) {
            return {
                isDuplicate: true,
                reason: 'Частичное совпадение заголовка (>70%)',
                originalNews: partialMatch,
            };
        }

        // 3. Совпадение по источнику и дате
        if (source) {
            const sourceMatch = await this.findSourceMatch(source, title);
            if (sourceMatch) {
                return {
                    isDuplicate: true,
                    reason: 'Совпадение по источнику',
                    originalNews: sourceMatch,
                };
            }
        }

        // 4. Проверка по ключевым словам
        if (content) {
            const keywords = this.extractKeywords(title + ' ' + content);
            const keywordMatch = await this.findKeywordMatch(keywords);
            if (keywordMatch) {
                return {
                    isDuplicate: true,
                    reason: 'Совпадение по ключевым словам',
                    originalNews: keywordMatch,
                };
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
     * Совпадение по источнику
     */
    private async findSourceMatch(source: string, title: string): Promise<News | null> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.newsRepository.findOne({
            where: {
                source: ILike(`%${source}%`),
                createdAt: MoreThanOrEqual(today),
            },
        });
    }

    /**
     * Поиск по ключевым словам
     */
    private async findKeywordMatch(keywords: string[]): Promise<News | null> {
        if (keywords.length < 3) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queryBuilder = this.newsRepository.createQueryBuilder('news')
            .where('news.createdAt > :date', { date: today });

        keywords.forEach((keyword, index) => {
            queryBuilder.orWhere(`news.title ILIKE :keyword${index}`, {
                [`keyword${index}`]: `%${keyword}%`,
            });
        });

        const matches = await queryBuilder.take(5).getMany();

        if (matches.length > 0) {
            // Если больше 3 ключевых слов совпадает - это дубликат
            for (const match of matches) {
                const matchKeywords = this.extractKeywords(match.title);
                const commonKeywords = keywords.filter(k => matchKeywords.includes(k));

                if (commonKeywords.length >= 3) {
                    return match;
                }
            }
        }

        return null;
    }

    /**
     * Извлечение ключевых слов из текста
     */
    private extractKeywords(text: string): string[] {
        const stopWords = ['в', 'на', 'с', 'по', 'из', 'от', 'для', 'и', 'а', 'но', 'или'];

        return text
            .toLowerCase()
            .replace(/[^а-яёa-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 10);
    }

    /**
     * Расчет схожести строк (коэффициент Жаккара)
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const words1 = new Set(str1.toLowerCase().split(/\s+/));
        const words2 = new Set(str2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Фильтр по дате (последние 7 дней)
     */
    private getRecentDateFilter(): any {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return MoreThanOrEqual(date);
    }

    /**
     * Очистка дубликатов (для админов)
     */
    async cleanDuplicates(): Promise<{ removed: number }> {
        const duplicates = await this.newsRepository
            .createQueryBuilder('news')
            .select('news.title', 'title')
            .addSelect('COUNT(*)', 'count')
            .where('news.createdAt > :date', {
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            })
            .groupBy('news.title')
            .having('COUNT(*) > 1')
            .getRawMany();

        let removed = 0;

        for (const dup of duplicates) {
            const items = await this.newsRepository.find({
                where: { title: dup.title },
                order: { createdAt: 'ASC' },
            });

            // Оставляем первый, удаляем остальные
            for (let i = 1; i < items.length; i++) {
                await this.newsRepository.remove(items[i]);
                removed++;
            }
        }

        return { removed };
    }
}