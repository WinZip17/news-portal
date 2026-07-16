import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, Between } from 'typeorm';
import { News, NewsStatus } from '../../entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private newsRepository: Repository<News>,
    ) {}

    async findAll(filters: any) {
        const {
            page = 1,
            limit = 10,
            category,
            status = NewsStatus.PUBLISHED,
            search,
            fromDate,
            toDate,
            sortBy = 'publishedAt',
            sortOrder = 'DESC',
            isAiGenerated,
            authorId,
        } = filters;

        const where: any = {};

        if (status) where.status = status;
        if (category) where.category = category;
        if (isAiGenerated !== undefined) where.isAiGenerated = isAiGenerated;
        if (authorId) where.authorId = authorId;

        if (search) {
            where.title = ILike(`%${search}%`);
        }

        if (fromDate && toDate) {
            where.publishedAt = Between(new Date(fromDate), new Date(toDate));
        }

        const [data, total] = await this.newsRepository.findAndCount({
            where,
            // Исправлено: убран select с relations
            relations: {
                author: true,
            },
            order: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Убираем пароль и refreshToken из автора, если он есть
        const sanitizedData = data.map(news => {
            if (news.author) {
                const { password, refreshToken, ...authorWithoutSensitive } = news.author as any;
                return {
                    ...news,
                    author: authorWithoutSensitive,
                };
            }
            return news;
        });

        return {
            data: sanitizedData,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const news = await this.newsRepository.findOne({
            where: { id },
            relations: {
                author: true,
            },
        });

        if (!news) {
            throw new NotFoundException('Новость не найдена');
        }

        // Увеличиваем счетчик просмотров
        await this.newsRepository.increment({ id }, 'views', 1);
        news.views += 1;

        // Убираем чувствительные данные автора
        if (news.author) {
            const { password, refreshToken, ...authorWithoutSensitive } = news.author as any;
            return {
                ...news,
                author: authorWithoutSensitive,
            };
        }

        return news;
    }

    async create(createNewsDto: CreateNewsDto, authorId?: string) {
        const news = this.newsRepository.create({
            ...createNewsDto,
            authorId,
            status: authorId ? NewsStatus.PUBLISHED : NewsStatus.PENDING,
            publishedAt: new Date(),
        });

        return this.newsRepository.save(news);
    }

    async update(id: string, updateData: Partial<News>) {
        const news = await this.findOne(id);

        // Убираем id из данных обновления
        const { id: _, author, ...safeUpdateData } = updateData as any;

        Object.assign(news, safeUpdateData);
        return this.newsRepository.save(news);
    }

    async delete(id: string) {
        const news = await this.findOne(id);
        return this.newsRepository.remove(news);
    }

    async moderate(id: string, status: NewsStatus, moderatorId: string, comment?: string) {
        const news = await this.findOne(id);

        news.status = status;
        news.moderatedBy = moderatorId;
        news.moderatedAt = new Date();
        news.moderationComment = comment || '';

        return this.newsRepository.save(news);
    }

    async like(id: string) {
        const news = await this.findOne(id);
        news.likes += 1;
        return this.newsRepository.save(news);
    }

    async findPersonalized(preferences: any) {
        // Упрощенная логика персонализации
        const category = preferences?.categories?.[0] || undefined;

        return this.findAll({
            category,
            limit: 20,
            sortBy: 'publishedAt',
            sortOrder: 'DESC',
        });
    }

    // Дополнительный метод для подсчета новостей
    async countByStatus(status: NewsStatus): Promise<number> {
        return this.newsRepository.count({
            where: { status },
        });
    }

    // Дополнительный метод для получения популярных новостей
    async getPopular(limit: number = 10) {
        return this.newsRepository.find({
            where: { status: NewsStatus.PUBLISHED },
            order: { views: 'DESC' },
            take: limit,
            relations: {
                author: true,
            },
        });
    }

    // Дополнительный метод для получения новостей по тегам
    async findByTags(tags: string[], limit: number = 10) {
        const queryBuilder = this.newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author')
            .where('news.status = :status', { status: NewsStatus.PUBLISHED });

        if (tags && tags.length > 0) {
            queryBuilder.andWhere('news.tags && :tags', { tags });
        }

        return queryBuilder
            .orderBy('news.publishedAt', 'DESC')
            .take(limit)
            .getMany();
    }

    // Метод для поиска новостей за период
    async findByDateRange(startDate: Date, endDate: Date) {
        return this.newsRepository.find({
            where: {
                publishedAt: Between(startDate, endDate),
                status: NewsStatus.PUBLISHED,
            },
            order: { publishedAt: 'DESC' },
            relations: {
                author: true,
            },
        });
    }

    // Метод для архивации старых новостей
    async archiveOldNews(days: number = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const oldNews = await this.newsRepository.find({
            where: {
                publishedAt: Between(new Date(0), date) as any,
                status: NewsStatus.PUBLISHED,
            },
        });

        for (const news of oldNews) {
            news.status = NewsStatus.ARCHIVED;
            await this.newsRepository.save(news);
        }

        return { archived: oldNews.length };
    }
}