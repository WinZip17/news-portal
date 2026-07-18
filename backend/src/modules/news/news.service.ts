import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, ILike, Between, In, MoreThanOrEqual } from 'typeorm';
import { News, NewsCategory, NewsStatus } from '../../entities';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsStatsDto } from "./dto/stats.dto";
import { Favorite } from '../../entities/favorite.entity'

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {
  }

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

  /**
   * Автоматическое подтверждение новостей старше 1 часа
   */
  async autoApproveOldNews(): Promise<{ approved: number; news: any[] }> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const pendingNews = await this.newsRepository.find({
      where: {
        status: NewsStatus.PENDING,
        createdAt: LessThan(oneHourAgo),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
      },
    });

    if (pendingNews.length > 0) {
      // Логируем какие новости будут подтверждены
      console.log(`📋 Auto-approving ${pendingNews.length} news:`);
      pendingNews.forEach(news => {
        console.log(`  - ${news.title} (created: ${news.createdAt})`);
      });

      // Подтверждаем
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

  /**
   * Проверка на дубликат новости по заголовку
   */
  async isDuplicate(title: string, source?: string): Promise<boolean> {
    const query = this.newsRepository.createQueryBuilder('news')
      .where('news.title ILIKE :title', { title: `%${title.substring(0, 50)}%` });

    if (source) {
      query.orWhere('news.source = :source AND news.title ILIKE :title', {
        source,
        title: `%${title.substring(0, 30)}%`
      });
    }

    // Проверяем за последние 7 дней
    query.andWhere('news.createdAt > :date', {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Поиск похожих новостей
   */
  async findSimilar(title: string, threshold: number = 0.6): Promise<News[]> {
    // Поиск по первым 3 словам заголовка
    const words = title.split(' ').slice(0, 3).join(' ');

    return this.newsRepository.find({
      where: {
        title: ILike(`%${words}%`),
      },
      take: 5,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Статистика новостей
   */
  async getStats(): Promise<NewsStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      newsToday,
      totalNews,
      totalAiNews,
      pendingNews,
      newsLastHour,
      totalViews,
    ] = await Promise.all([
      this.newsRepository.count({
        where: { createdAt: MoreThanOrEqual(today) },
      }),
      this.newsRepository.count(),
      this.newsRepository.count({
        where: { isAiGenerated: true },
      }),
      this.newsRepository.count({
        where: { status: NewsStatus.PENDING },
      }),
      this.newsRepository.count({
        where: { createdAt: MoreThanOrEqual(new Date(Date.now() - 3600000)) },
      }),
      this.newsRepository.sum('views'),
    ]);

    return {
      newsToday,
      totalNews,
      totalAiNews,
      pendingNews,
      newsLastHour,
      totalViews: totalViews || 0,
      totalUsers: 0, // Будет заполнено ниже
      activeSources: 0,
      categoriesCount: Object.keys(NewsCategory).length,
    };
  }

  /**
   * Переключение избранного
   */
  async toggleFavorite(userId: string, newsId: string): Promise<{ favorited: boolean }> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, newsId },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { favorited: false };
    }

    await this.favoriteRepository.save({ userId, newsId });
    return { favorited: true };
  }

  /**
   * Получение избранного
   */
  async getFavorites(userId: string, page = 1, limit = 20): Promise<{ data: News[]; total: number; page: number; limit: number; totalPages: number }> {
    const [data, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: {
        news: {
          author: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map(f => f.news),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Проверка избранного
   */
  async isFavorited(userId: string, newsId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({ where: { userId, newsId } });
    return count > 0;
  }
}