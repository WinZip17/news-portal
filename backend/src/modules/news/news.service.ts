import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, MoreThanOrEqual } from 'typeorm';
import { News, Favorite, Like } from '../../entities';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsStatsDto } from './dto/stats.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NewsCategory, NewsFilter, NewsStatus } from '../../types';
import { normalizeTagsFilter, resolveSortColumn } from './news-search.utils';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(filters: NewsFilter) {
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
      tags,
    } = filters;

    const normalizedTags = normalizeTagsFilter(tags);
    const normalizedSearch = search?.trim();
    const orderColumn = resolveSortColumn(sortBy);

    const queryBuilder = this.newsRepository.createQueryBuilder('news').leftJoinAndSelect('news.author', 'author');

    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }
    if (category) {
      queryBuilder.andWhere('news.category = :category', { category });
    }
    if (isAiGenerated !== undefined) {
      queryBuilder.andWhere('news.isAiGenerated = :isAiGenerated', { isAiGenerated });
    }
    if (authorId) {
      queryBuilder.andWhere('news.authorId = :authorId', { authorId });
    }
    if (fromDate && toDate) {
      queryBuilder.andWhere('news.publishedAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    }
    if (normalizedSearch) {
      queryBuilder.andWhere(`news.search_vector @@ plainto_tsquery('russian', :search)`, {
        search: normalizedSearch,
      });
    }
    if (normalizedTags) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(string_to_array(news.tags, ',')) AS t(tag)
          WHERE lower(trim(t.tag)) IN (:...tags)
        )`,
        { tags: normalizedTags },
      );
    }

    queryBuilder.orderBy(`news.${orderColumn}`, sortOrder);
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const sanitizedData = data.map((news) => {
      if (news.author) {
        const { password, refreshToken, ...authorWithoutSensitive } = news.author;
        return { ...news, author: authorWithoutSensitive };
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
      relations: { author: true },
    });

    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }

    await this.newsRepository.increment({ id }, 'views', 1);
    news.views += 1;

    if (news.author) {
      const { password, refreshToken, ...authorWithoutSensitive } = news.author;
      return { ...news, author: authorWithoutSensitive };
    }

    return news;
  }

  async create(createNewsDto: CreateNewsDto, authorId?: string) {
    const news = this.newsRepository.create({
      ...createNewsDto,
      authorId,
      status: NewsStatus.PENDING,
      publishedAt: new Date(),
    });
    return this.newsRepository.save(news);
  }

  async update(id: string, updateData: Partial<Omit<News, 'id' | 'author'>>) {
    const news = await this.findOne(id);
    const { id: _, author, ...safeUpdateData } = updateData as News;
    Object.assign(news, safeUpdateData);
    return this.newsRepository.save(news);
  }

  async delete(id: string) {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }
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

  async like(userId: string, newsId: string): Promise<{ liked: boolean; likes: number }> {
    const existing = await this.likeRepository.findOne({ where: { userId, newsId } });

    if (existing) {
      await this.likeRepository.remove(existing);
      await this.newsRepository.decrement({ id: newsId }, 'likes', 1);
      const news = await this.newsRepository.findOne({ where: { id: newsId } });
      return { liked: false, likes: news?.likes || 0 };
    }

    await this.likeRepository.save({ userId, newsId });
    await this.newsRepository.increment({ id: newsId }, 'likes', 1);
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    return { liked: true, likes: news?.likes || 0 };
  }

  async isLiked(userId: string, newsId: string): Promise<boolean> {
    const count = await this.likeRepository.count({ where: { userId, newsId } });
    return count > 0;
  }

  async findPersonalized(preferences: { categories?: string[] }) {
    const category = preferences?.categories?.[0] || undefined;
    return this.findAll({ category: category as NewsCategory, limit: 20, sortBy: 'publishedAt', sortOrder: 'DESC' });
  }

  async autoApproveOldNews(): Promise<{ approved: number; news: { id: string; title: string }[] }> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const pendingNews = await this.newsRepository.find({
      where: { status: NewsStatus.PENDING, createdAt: LessThan(oneHourAgo) },
      select: { id: true, title: true, createdAt: true, status: true },
    });

    if (pendingNews.length > 0) {
      this.logger.log(`📋 Auto-approving ${pendingNews.length} news:`);
      pendingNews.forEach((news) => this.logger.log(`  - ${news.title}`));

      await this.newsRepository.update(
        { id: In(pendingNews.map((n) => n.id)) },
        {
          status: NewsStatus.PUBLISHED,
          moderatedBy: 'system',
          moderatedAt: new Date(),
          moderationComment: 'Автоматическое подтверждение (ожидание более 1 часа)',
        },
      );
    }

    return { approved: pendingNews.length, news: pendingNews.map((n) => ({ id: n.id, title: n.title })) };
  }

  async getStats(): Promise<NewsStatsDto> {
    const cacheKey = 'news:stats';

    try {
      const cached = await this.cacheManager.get<NewsStatsDto>(cacheKey);
      if (cached) return cached;
    } catch {
      // Кэш недоступен
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [newsToday, totalNews, totalAiNews, pendingNews, newsLastHour, totalViews] = await Promise.all([
      this.newsRepository.count({ where: { createdAt: MoreThanOrEqual(today) } }),
      this.newsRepository.count(),
      this.newsRepository.count({ where: { isAiGenerated: true } }),
      this.newsRepository.count({ where: { status: NewsStatus.PENDING } }),
      this.newsRepository.count({ where: { createdAt: MoreThanOrEqual(new Date(Date.now() - 3600000)) } }),
      this.newsRepository.sum('views'),
    ]);

    const result: NewsStatsDto = {
      newsToday,
      totalNews,
      totalAiNews,
      pendingNews,
      newsLastHour,
      totalViews: totalViews || 0,
      totalUsers: 0,
      activeSources: 0,
      categoriesCount: Object.keys(NewsCategory).length,
    };

    try {
      await this.cacheManager.set(cacheKey, result, 60000);
    } catch {
      // Кэш недоступен
    }

    return result;
  }

  async toggleFavorite(userId: string, newsId: string): Promise<{ favorited: boolean }> {
    const existing = await this.favoriteRepository.findOne({ where: { userId, newsId } });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { favorited: false };
    }

    await this.favoriteRepository.save({ userId, newsId });
    return { favorited: true };
  }

  async getFavorites(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: News[]; total: number; page: number; limit: number; totalPages: number }> {
    const [data, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: { news: { author: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.map((f) => f.news), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async isFavorited(userId: string, newsId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({ where: { userId, newsId } });
    return count > 0;
  }
}
