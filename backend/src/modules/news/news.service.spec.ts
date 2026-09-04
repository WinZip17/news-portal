import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsService } from './news.service';
import { News, Favorite, Like } from '../../entities';
import { NewsCategory, NewsStatus } from '../../types';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { publishedAtCalendarDateSql } from './news-search.utils';
import { NewsGateway } from './news.gateway';

describe('NewsService', () => {
  let service: NewsService;
  let newsRepository: Repository<News>;
  let newsGateway: { emitNewsPending: jest.Mock; emitNewsPublished: jest.Mock };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const mockNews = {
    id: '123',
    title: 'Test News',
    content: '<p>Test content</p>',
    summary: 'Test summary',
    category: NewsCategory.TECHNOLOGY,
    status: NewsStatus.PUBLISHED,
    isAiGenerated: false,
    views: 0,
    likes: 0,
    tags: ['test'],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockNews], 1]),
    };

    newsGateway = {
      emitNewsPending: jest.fn(),
      emitNewsPublished: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(News),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
            findAndCount: jest.fn().mockResolvedValue([[mockNews], 1]),
            findOne: jest.fn().mockResolvedValue(mockNews),
            create: jest.fn().mockReturnValue(mockNews),
            save: jest.fn().mockResolvedValue(mockNews),
            increment: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(1),
            sum: jest.fn().mockResolvedValue(100),
            remove: jest.fn().mockResolvedValue(mockNews),
          },
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            count: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: getRepositoryToken(Like),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NewsGateway,
          useValue: newsGateway,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    newsRepository = module.get<Repository<News>>(getRepositoryToken(News));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const publishedOn = publishedAtCalendarDateSql();

    it('should return paginated news', async () => {
      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('applies fromDate filter alone', async () => {
      await service.findAll({ fromDate: '2026-03-01' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} >= CAST(:fromDate AS date)`, {
        fromDate: '2026-03-01',
      });
    });

    it('applies toDate filter alone', async () => {
      await service.findAll({ toDate: '2026-03-13' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} < CAST(:toDateExclusive AS date)`, {
        toDateExclusive: '2026-03-14',
      });
    });

    it('applies both date filters independently', async () => {
      await service.findAll({ fromDate: '2026-03-01', toDate: '2026-03-13' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} >= CAST(:fromDate AS date)`, {
        fromDate: '2026-03-01',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} < CAST(:toDateExclusive AS date)`, {
        toDateExclusive: '2026-03-14',
      });
    });

    it('filters a single calendar day in Moscow timezone', async () => {
      await service.findAll({ fromDate: '2026-08-19', toDate: '2026-08-19' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} >= CAST(:fromDate AS date)`, {
        fromDate: '2026-08-19',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} < CAST(:toDateExclusive AS date)`, {
        toDateExclusive: '2026-08-20',
      });
    });

    it('includes news from 2026-08-30 in range 2026-08-02 to 2026-09-13', async () => {
      await service.findAll({ fromDate: '2026-08-02', toDate: '2026-09-13' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} >= CAST(:fromDate AS date)`, {
        fromDate: '2026-08-02',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(`${publishedOn} < CAST(:toDateExclusive AS date)`, {
        toDateExclusive: '2026-09-14',
      });
    });

    it('ignores invalid date format', async () => {
      await service.findAll({ fromDate: '01.03.2026', toDate: '2026-03-01T00:00:00.000Z' });

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(expect.stringContaining('publishedAt'), expect.anything());
    });

    it('filters news with hasImage=true', async () => {
      await service.findAll({ hasImage: true });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "news.imageUrl IS NOT NULL AND TRIM(news.imageUrl) <> '' AND news.imageUrl NOT LIKE :placeholderPrefix",
        { placeholderPrefix: 'data:image/svg+xml;base64,%' },
      );
    });

    it('filters news with hasImage=false', async () => {
      await service.findAll({ hasImage: false });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "(news.imageUrl IS NULL OR TRIM(news.imageUrl) = '' OR news.imageUrl LIKE :placeholderPrefix)",
        { placeholderPrefix: 'data:image/svg+xml;base64,%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a news by id', async () => {
      const result = await service.findOne('123');
      expect(result.title).toBe('Test News');
    });

    it('should throw NotFoundException if news not found', async () => {
      jest.spyOn(newsRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a news', async () => {
      const dto = {
        title: 'New News',
        content: 'Content',
        category: NewsCategory.TECHNOLOGY,
      };
      const result = await service.create(dto, 'user1');
      expect(result).toBeDefined();
      expect(newsGateway.emitNewsPending).toHaveBeenCalledTimes(1);
    });
  });

  describe('like', () => {
    it('should toggle like', async () => {
      const result = await service.like('user1', '123');
      expect(result.liked).toBeDefined();
      expect(result.likes).toBeDefined();
    });
  });
});
