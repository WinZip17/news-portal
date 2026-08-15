import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

const SEARCH_INDEX_DDL = `
  CREATE INDEX IF NOT EXISTS idx_news_search_vector ON news USING GIN (search_vector);
`;

@Injectable()
export class NewsSearchIndexService implements OnModuleInit {
  private readonly logger = new Logger(NewsSearchIndexService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(SEARCH_INDEX_DDL);
      this.logger.log('News full-text search index ready (GIN on search_vector)');
    } catch (error) {
      this.logger.error('Failed to ensure news search index', error);
      throw error;
    }
  }
}
