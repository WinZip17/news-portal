import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, jest, expect, describe, it } from '@jest/globals';
import { AiService } from './ai.service';
import { AiConfig } from './config/ai.config';
import { RssFetcherService } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { News, Settings } from '../../entities';
import { NewsCategory } from '../../types';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

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
          },
        },
        {
          provide: RssFetcherService,
          useValue: {
            fetchNewsByCategory: jest.fn().mockResolvedValue([] as never),
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
          provide: getRepositoryToken(News),
          useValue: {
            create: jest.fn().mockReturnValue(mockNews),
            save: jest.fn().mockResolvedValue(mockNews as never),
          },
        },
        {
          provide: getRepositoryToken(Settings),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null as never),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
            getCronJob: jest.fn(),
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
