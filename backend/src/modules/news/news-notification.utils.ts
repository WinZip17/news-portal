import { News } from '../../entities';
import { NewsNotificationPayload } from '../../types';

export function toNewsNotificationPayload(news: News): NewsNotificationPayload {
  return {
    id: news.id,
    title: news.title,
    summary: news.summary ?? null,
    category: news.category,
    status: news.status,
    isAiGenerated: news.isAiGenerated,
    publishedAt: news.publishedAt.toISOString(),
    createdAt: news.createdAt.toISOString(),
  };
}
