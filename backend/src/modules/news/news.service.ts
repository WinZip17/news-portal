import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, ILike, Between, In, MoreThanOrEqual } from 'typeorm';
import { News, NewsCategory, NewsStatus } from '../../entities';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsStatsDto } from "./dto/stats.dto";
import { Favorite } from '../../entities/favorite.entity'
import { Like } from '../../entities/like.entity'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @Inject(CACHE_MANAGER) private cacheManager: any,
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

    const cacheKey = `news:list:${JSON.stringify(filters)}`;

    const cached = await this.cacheManager.store.get(cacheKey);
    if (cached) {
      return cached;
    }

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
      relations: {
        author: true,
      },
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

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

    const result = {
      data: sanitizedData,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheManager.store.set(cacheKey, result, 300000);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `news:detail:${id}`;

    const cached = await this.cacheManager.store.get(cacheKey);
    if (cached) {
      return cached;
    }

    const news = await this.newsRepository.findOne({
      where: { id },
      relations: {
        author: true,
      },
    });

    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }

    await this.newsRepository.increment({ id }, 'views', 1);
    news.views += 1;

    let result;
    if (news.author) {
      const { password, refreshToken, ...authorWithoutSensitive } = news.author as any;
      result = {
        ...news,
        author: authorWithoutSensitive,
      };
    } else {
      result = news;
    }

    await this.cacheManager.store.set(cacheKey, result, 600000);

    return result;
  }

  async create(createNewsDto: CreateNewsDto, authorId?: string) {
    const news = this.newsRepository.create({
      ...createNewsDto,
      authorId,
      status: authorId ? NewsStatus.PUBLISHED : NewsStatus.PENDING,
      publishedAt: new Date(),
    });

    // Сброс кэша
    await this.cacheManager.store.del('news:stats');

    return this.newsRepository.save(news);
  }

  async update(id: string, updateData: Partial<News>) {
    const news = await this.findOne(id);
    const { id: _, author, ...safeUpdateData } = updateData as any;
    Object.assign(news, safeUpdateData);

    // Сброс кэша
    await this.cacheManager.store.del(`news:detail:${id}`);

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

  async like(userId: string, newsId: string): Promise<{ liked: boolean; likes: number }> {
    const existing = await this.likeRepository.findOne({
      where: { userId, newsId },
    });

    if (existing) {
      await this.likeRepository.remove(existing);
      await this.newsRepository.decrement({ id: newsId }, 'likes', 1);
      const news = await this.newsRepository.findOne({ where: { id: newsId } });
      await this.cacheManager.store.del(`news:detail:${newsId}`);
      return { liked: false, likes: news?.likes || 0 };
    }

    await this.likeRepository.save({ userId, newsId });
    await this.newsRepository.increment({ id: newsId }, 'likes', 1);
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    await this.cacheManager.store.del(`news:detail:${newsId}`);
    return { liked: true, likes: news?.likes || 0 };
  }

  async isLiked(userId: string, newsId: string): Promise<boolean> {
    const count = await this.likeRepository.count({ where: { userId, newsId } });
    return count > 0;
  }

  async findPersonalized(preferences: any) {
    const category = preferences?.categories?.[0] || undefined;
    return this.findAll({
      category,
      limit: 20,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
    });
  }

  async countByStatus(status: NewsStatus): Promise<number> {
    return this.newsRepository.count({ where: { status } });
  }

  async getPopular(limit: number = 10) {
    return this.newsRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { views: 'DESC' },
      take: limit,
      relations: { author: true },
    });
  }

  async findByTags(tags: string[], limit: number = 10) {
    const queryBuilder = this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED });
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('news.tags && :tags', { tags });
    }
    return queryBuilder.orderBy('news.publishedAt', 'DESC').take(limit).getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.newsRepository.find({
      where: {
        publishedAt: Between(startDate, endDate),
        status: NewsStatus.PUBLISHED,
      },
      order: { publishedAt: 'DESC' },
      relations: { author: true },
    });
  }

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

  async autoApproveOldNews(): Promise<{ approved: number; news: any[] }> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const pendingNews = await this.newsRepository.find({
      where: { status: NewsStatus.PENDING, createdAt: LessThan(oneHourAgo) },
      select: { id: true, title: true, createdAt: true, status: true },
    });
    if (pendingNews.length > 0) {
      await this.newsRepository.update(
        { id: In(pendingNews.map(n => n.id)) },
        {
          status: NewsStatus.PUBLISHED,
          moderatedBy: 'system',
          moderatedAt: new Date(),
          moderationComment: 'Автоматическое подтверждение (ожидание более 1 часа)',
        }
      );
    }
    return {
      approved: pendingNews.length,
      news: pendingNews.map(n => ({ id: n.id, title: n.title }))
    };
  }

  async isDuplicate(title: string, source?: string): Promise<boolean> {
    const query = this.newsRepository.createQueryBuilder('news')
      .where('news.title ILIKE :title', { title: `%${title.substring(0, 50)}%` });
    if (source) {
      query.orWhere('news.source = :source AND news.title ILIKE :title', {
        source, title: `%${title.substring(0, 30)}%`
      });
    }
    query.andWhere('news.createdAt > :date', {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });
    const count = await query.getCount();
    return count > 0;
  }

  async findSimilar(title: string, threshold: number = 0.6): Promise<News[]> {
    const words = title.split(' ').slice(0, 3).join(' ');
    return this.newsRepository.find({
      where: { title: ILike(`%${words}%`) },
      take: 5,
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<NewsStatsDto> {
    const cacheKey = 'news:stats';

    const cached = await this.cacheManager.store.get(cacheKey);
    if (cached) {
      return cached;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      newsToday, totalNews, totalAiNews, pendingNews, newsLastHour, totalViews,
    ] = await Promise.all([
      this.newsRepository.count({ where: { createdAt: MoreThanOrEqual(today) } }),
      this.newsRepository.count(),
      this.newsRepository.count({ where: { isAiGenerated: true } }),
      this.newsRepository.count({ where: { status: NewsStatus.PENDING } }),
      this.newsRepository.count({ where: { createdAt: MoreThanOrEqual(new Date(Date.now() - 3600000)) } }),
      this.newsRepository.sum('views'),
    ]);

    const result = {
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

    await this.cacheManager.store.set(cacheKey, result, 60000);

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

  async getFavorites(userId: string, page = 1, limit = 20): Promise<{
    data: News[]; total: number; page: number; limit: number; totalPages: number
  }> {
    const [data, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: { news: { author: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data.map(f => f.news),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isFavorited(userId: string, newsId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({ where: { userId, newsId } });
    return count > 0;
  }
}