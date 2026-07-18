import { Injectable, Logger } from '@nestjs/common';
import RssParser from 'rss-parser';

@Injectable()
export class RssFetcherService {
  private readonly logger = new Logger(RssFetcherService.name);
  private parser: RssParser;

  // RSS источники по категориям
  private readonly rssSources: Record<string, string[]> = {
    technology: [
      'https://habr.com/ru/rss/articles/?fl=ru',
      'https://3dnews.ru/news/rss',
      'https://www.ixbt.com/export/rss.xml',
    ],
    politics: [
      'https://lenta.ru/rss/top7',
      'https://ria.ru/export/rss2/index.xml',
      'https://tass.ru/rss/v2.xml',
    ],
    economy: [
      'https://www.rbc.ru/rss/',
      'https://www.kommersant.ru/RSS/news.xml',
      'https://www.vedomosti.ru/rss/news',
    ],
    science: [
      'https://nplus1.ru/rss',
      'https://elementy.ru/rss',
      'https://scientificrussia.ru/rss',
    ],
    sports: [
      'https://www.sport-express.ru/rss/',
      'https://www.championat.com/rss/',
      'https://www.sports.ru/rss/main.xml',
    ],
    world: [
      'https://lenta.ru/rss/news',
      'https://ria.ru/export/rss2/world/index.xml',
      'https://www.interfax.ru/rss.asp',
    ],
    health: [
      'https://medportal.ru/rss/',
      'https://www.gazeta.ru/health/rss/',
    ],
    entertainment: [
      'https://www.kinoafisha.info/rss/',
      'https://news.myseldon.com/ru/rss?rubricId=3',
    ],
  };

  constructor() {
    this.parser = new RssParser({
      customFields: {
        item: ['description', 'content:encoded', 'enclosure'],
      },
    });
  }

  /**
   * Получение новостей из RSS источников
   */
  async fetchNewsByCategory(category: string, limit: number = 3): Promise<RssArticle[]> {
    const sources = this.rssSources[category] || this.rssSources.world;
    const articles: RssArticle[] = [];

    for (const source of sources) {
      try {
        const feed = await this.parser.parseURL(source);

        if (feed.items && feed.items.length > 0) {
          const newArticles = feed.items
            .slice(0, limit)
            .map(item => this.parseArticle(item, feed.title || source));

          articles.push(...newArticles);
        }
      } catch (error) {
        this.logger.error(`Failed to fetch RSS from ${source}:`, error.message);
        continue;
      }
    }

    // Перемешиваем и берем нужное количество
    return this.shuffleArray(articles).slice(0, limit);
  }

  /**
   * Поиск новостей по ключевым словам через RSS
   */
  async searchNews(query: string, limit: number = 5): Promise<RssArticle[]> {
    const allSources = Object.values(this.rssSources).flat();
    const articles: RssArticle[] = [];

    for (const source of allSources.slice(0, 5)) {
      try {
        const feed = await this.parser.parseURL(source);

        if (feed.items) {
          const matchingArticles = feed.items
            .filter(item =>
              item.title?.toLowerCase().includes(query.toLowerCase()) ||
              item.contentSnippet?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 2)
            .map(item => this.parseArticle(item, feed.title || source));

          articles.push(...matchingArticles);
        }
      } catch (error) {
        continue;
      }
    }

    return articles.slice(0, limit);
  }

  /**
   * Получение одной случайной новости
   */
  async fetchRandomNews(category?: string): Promise<RssArticle | null> {
    const cat = category || this.getRandomCategory();
    const articles = await this.fetchNewsByCategory(cat, 5);

    return articles.length > 0
      ? articles[Math.floor(Math.random() * articles.length)]
      : null;
  }

  /**
   * Парсинг статьи из RSS
   */
  private parseArticle(item: any, sourceName: string): RssArticle {
    return {
      title: this.cleanText(item.title || 'Без заголовка'),
      content: this.cleanHtml(item['content:encoded'] || item.content || item.description || ''),
      summary: this.cleanText(item.contentSnippet || item.description || ''),
      link: item.link || '',
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: sourceName,
      author: item.creator || item.author || 'Неизвестно',
      imageUrl: this.extractImage(item),
      categories: item.categories || [],
    };
  }

  /**
   * Извлечение изображения из RSS
   */
  private extractImage(item: any): string {
    if (item.enclosure?.url) return item.enclosure.url;
    if (item['media:content']?.url) return item['media:content'].url;

    // Поиск первого изображения в HTML контенте
    const htmlContent = item['content:encoded'] || item.content || '';
    const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);

    return imgMatch ? imgMatch[1] : '';
  }

  /**
   * Очистка текста от HTML тегов
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Очистка HTML контента (оставляем базовые теги)
   */
  private cleanHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  /**
   * Перемешивание массива
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Получение случайной категории
   */
  private getRandomCategory(): string {
    const categories = Object.keys(this.rssSources);
    return categories[Math.floor(Math.random() * categories.length)];
  }
}

export interface RssArticle {
  title: string;
  content: string;
  summary: string;
  link: string;
  pubDate: Date;
  source: string;
  author: string;
  imageUrl: string;
  categories: string[];
}