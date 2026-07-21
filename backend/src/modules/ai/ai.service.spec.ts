import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, jest, expect, describe, it } from '@jest/globals';
import { AiService } from './ai.service';
import { AiConfig } from './config/ai.config';
import { RssFetcherService } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { NewsService } from '../news/news.service';
import { News, NewsCategory } from '../../entities';
import { ConfigService } from '@nestjs/config';

describe('AiService', () => {
  let service: AiService;

  const mockNews = {
    id: '123',
    title: 'Test',
    content: '<p>Test</p>',
    category: NewsCategory.TECHNOLOGY,
    isAiGenerated: true,
    status: 'pending',
    views: 0,
    likes: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiConfig,
          useValue: {
            apiKey: 'test-key',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000,
            categories: ['technology', 'science'],
            prompts: {
              title: 'Generate title',
              summary: 'Generate summary',
              content: 'Generate content',
              tags: 'Generate tags',
            },
          },
        },
        {
          provide: RssFetcherService,
          useValue: {
            fetchNewsByCategory: jest.fn().mockResolvedValue([] as never),
            fetchRandomNews: jest.fn().mockResolvedValue(null as never),
            getCategoryFromSource: jest.fn().mockReturnValue(NewsCategory.TECHNOLOGY),
          },
        },
        {
          provide: DeduplicationService,
          useValue: {
            checkDuplicate: jest.fn().mockResolvedValue({ isDuplicate: false } as never),
          },
        },
        {
          provide: NewsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(News),
          useValue: {
            create: jest.fn().mockReturnValue(mockNews),
            save: jest.fn().mockResolvedValue(mockNews as never),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check availability', async () => {
    const result = await service.checkAvailability();
    expect(result).toHaveProperty('available');
  });
});
