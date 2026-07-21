import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';

@Injectable()
export class NewsSchedulerService {
  private readonly logger = new Logger(NewsSchedulerService.name);

  constructor(private readonly newsService: NewsService) {}

  /**
   * Проверка каждые 10 минут - подтверждение новостей старше 1 часа
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoApprovePendingNews() {
    this.logger.log('🔍 Checking for old pending news...');

    try {
      const result = await this.newsService.autoApproveOldNews();

      if (result.approved > 0) {
        this.logger.log(`✅ Auto-approved ${result.approved} news articles`);
      }
    } catch (error) {
      this.logger.error('Failed to auto-approve news:', error.message);
    }
  }
}
