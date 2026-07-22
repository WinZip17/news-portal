import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { NewsController } from './controllers/news.controller';
import { ProxyController } from './controllers/proxy.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController, NewsController, ProxyController, AuthController],
})
export class AppModule {}