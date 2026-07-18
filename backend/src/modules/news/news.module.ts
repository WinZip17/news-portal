import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsSchedulerService } from './news-scheduler.service';
import { News } from '../../entities';
import { AuthModule } from '../auth/auth.module';
import { Favorite } from '../../entities/favorite.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([News, Favorite]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsSchedulerService], // Добавлен планировщик
  exports: [NewsService],
})
export class NewsModule {
}