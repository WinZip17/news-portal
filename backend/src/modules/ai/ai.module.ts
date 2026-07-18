import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiConfig } from './config/ai.config';
import { RssFetcherService } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { NewsService } from '../news/news.service';
import { AuthModule } from '../auth/auth.module';
import { News } from "../../entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    ScheduleModule.forRoot(),
    ConfigModule,
    AuthModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiConfig,
    RssFetcherService,
    DeduplicationService,
    NewsService,
  ],
  exports: [AiService],
})
export class AiModule {
}