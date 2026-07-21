import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsService } from './news.service';
import { News, NewsStatus, NewsCategory } from '../../entities';
import { Favorite } from '../../entities';
import { Like } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('NewsService', () => {
  let service: NewsService;
  let newsRepository: Repository<News>;
  let favoriteRepository: Repository<Favorite>;
  let likeRepository: Repository<Like>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(News),
          useValue: {
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
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    newsRepository = module.get<Repository<News>>(getRepositoryToken(News));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated news', async () => {
      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
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
