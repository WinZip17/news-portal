import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NewsGateway } from './news.gateway';
import { NEWS_WS_EVENTS } from '../../types';
import { NewsCategory, NewsStatus, UserRole } from '../../types';

describe('NewsGateway', () => {
  let gateway: NewsGateway;
  let jwtService: { verify: jest.Mock };

  const mockServer = {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  };

  const mockNews = {
    id: 'news-1',
    title: 'Test headline',
    summary: 'Summary',
    category: NewsCategory.TECHNOLOGY,
    status: NewsStatus.PUBLISHED,
    isAiGenerated: true,
    publishedAt: new Date('2026-08-01T10:00:00.000Z'),
    createdAt: new Date('2026-08-01T09:00:00.000Z'),
  };

  beforeEach(async () => {
    jwtService = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsGateway,
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    gateway = module.get(NewsGateway);
    gateway.server = mockServer as never;
    jest.clearAllMocks();
  });

  it('joins moderators room for moderator token', () => {
    const join = jest.fn();
    jwtService.verify.mockReturnValue({ sub: '1', email: 'm@test.com', role: UserRole.MODERATOR });

    gateway.handleConnection({
      id: 'client-1',
      handshake: { auth: { token: 'valid-token' }, query: {} },
      join,
    } as never);

    expect(join).toHaveBeenCalledWith('moderators');
  });

  it('does not join moderators room without token', () => {
    const join = jest.fn();

    gateway.handleConnection({
      id: 'client-2',
      handshake: { auth: {}, query: {} },
      join,
    } as never);

    expect(join).not.toHaveBeenCalled();
  });

  it('broadcasts published news to all clients', () => {
    gateway.emitNewsPublished(mockNews as never);

    expect(mockServer.emit).toHaveBeenCalledWith(
      NEWS_WS_EVENTS.PUBLISHED,
      expect.objectContaining({ id: 'news-1', title: 'Test headline', status: NewsStatus.PUBLISHED }),
    );
  });

  it('sends pending news only to moderators room', () => {
    gateway.emitNewsPending({ ...mockNews, status: NewsStatus.PENDING } as never);

    expect(mockServer.to).toHaveBeenCalledWith('moderators');
    expect(mockServer.emit).toHaveBeenCalledWith(NEWS_WS_EVENTS.PENDING, expect.objectContaining({ id: 'news-1', status: NewsStatus.PENDING }));
  });
});
