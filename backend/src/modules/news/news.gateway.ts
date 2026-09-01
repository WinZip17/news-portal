import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NEWS_WS_EVENTS, UserRole, type NewsWsEvent } from '@news-portal/types';
import { Server, Socket } from 'socket.io';
import { WS_CORS_ORIGINS } from '../../common/ws-cors.constants';
import { News } from '../../entities';
import { toNewsNotificationPayload } from './news-notification.utils';

const MODERATORS_ROOM = 'moderators';

const NEWS_PUBLISHED_EVENT: NewsWsEvent = NEWS_WS_EVENTS.PUBLISHED;
const NEWS_PENDING_EVENT: NewsWsEvent = NEWS_WS_EVENTS.PENDING;

const MODERATOR_ROLES = new Set<string>([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

interface NewsWsJwtPayload {
  sub: string;
  email: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: WS_CORS_ORIGINS,
    credentials: true,
  },
  namespace: '/api/news',
  path: '/api/socket.io',
})
export class NewsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NewsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(): void {
    this.logger.log(`WebSocket ${NEWS_PUBLISHED_EVENT} (all), ${NEWS_PENDING_EVENT} (moderators)`);
  }

  handleConnection(client: Socket): void {
    const user = this.authenticateClient(client);
    if (user && MODERATOR_ROLES.has(user.role)) {
      void client.join(MODERATORS_ROOM);
      this.logger.debug(`Moderator connected: ${client.id} (${user.role})`);
      return;
    }

    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  emitNewsPublished(news: News): void {
    this.server.emit(NEWS_PUBLISHED_EVENT, toNewsNotificationPayload(news));
  }

  emitNewsPending(news: News): void {
    this.server.to(MODERATORS_ROOM).emit(NEWS_PENDING_EVENT, toNewsNotificationPayload(news));
  }

  private authenticateClient(client: Socket): NewsWsJwtPayload | null {
    const token = extractHandshakeToken(client);

    if (!token) {
      return null;
    }

    try {
      return this.jwtService.verify<NewsWsJwtPayload>(token);
    } catch {
      this.logger.debug(`Invalid WS token for client ${client.id}`);
      return null;
    }
  }
}

function extractHandshakeToken(client: Socket): string | null {
  const auth = client.handshake.auth as Record<string, unknown> | undefined;
  const query = client.handshake.query as Record<string, unknown> | undefined;

  const authToken = auth?.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    return authToken;
  }

  const queryToken = query?.token;
  if (typeof queryToken === 'string' && queryToken.length > 0) {
    return queryToken;
  }

  if (Array.isArray(queryToken)) {
    for (const item of queryToken) {
      if (typeof item === 'string' && item.length > 0) {
        return item;
      }
    }
  }

  return null;
}
