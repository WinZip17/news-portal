import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiConfig } from './config/ai.config';
import { RssFetcherService } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { AuthModule } from '../auth/auth.module';
import { NewsModule } from '../news/news.module';
import { News, Favorite, Like, Settings } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([News, Favorite, Like, Settings]), ScheduleModule.forRoot(), ConfigModule, AuthModule, NewsModule],
  controllers: [AiController],
  providers: [AiService, AiConfig, RssFetcherService, DeduplicationService],
  exports: [AiService],
})
export class AiModule {}
