import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { beforeEach, jest, expect, describe, it } from '@jest/globals';

describe('NewsController', () => {
  let controller: NewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 } as never),
            findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Test' } as never),
            getStats: jest.fn().mockResolvedValue({ newsToday: 5, totalNews: 100, totalAiNews: 50 } as never),
            like: jest.fn().mockResolvedValue({ liked: true, likes: 1 } as never),
            toggleFavorite: jest.fn().mockResolvedValue({ favorited: true } as never),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getTotalUsers: jest.fn().mockResolvedValue(10 as never),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return news list', async () => {
    const result = await controller.findAll({});
    expect(result.data).toEqual([]);
  });

  it('should return stats', async () => {
    const result = await controller.getStats();
    expect(result.newsToday).toBe(5);
  });
});