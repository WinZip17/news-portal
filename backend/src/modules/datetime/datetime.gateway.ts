import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { formatCurrentDatetime } from './format-datetime';

const WS_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:80',
  'https://short-news.ru',
  'https://www.short-news.ru',
  'https://next.short-news.ru',
  'https://nuxt.short-news.ru',
  'https://vue.short-news.ru',
];

@WebSocketGateway({
  cors: {
    origin: WS_CORS_ORIGINS,
    credentials: true,
  },
  namespace: '/api/datetime',
  path: '/api/socket.io',
})
export class DatetimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  private readonly logger = new Logger(DatetimeGateway.name);
  private interval?: NodeJS.Timeout;

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.interval = setInterval(() => this.broadcastDatetime(), 1000);
    this.logger.log('WebSocket /api/datetime: broadcast every 1s');
  }

  handleConnection(client: Socket): void {
    client.emit('datetime', formatCurrentDatetime());
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getDatetime')
  handleGetDatetime(client: Socket): { datetime: string } {
    const datetime = formatCurrentDatetime();
    client.emit('datetime', datetime);
    return { datetime };
  }

  onModuleDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private broadcastDatetime(): void {
    this.server.emit('datetime', formatCurrentDatetime());
  }
}
