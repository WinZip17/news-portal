import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { News, NewsCategory, NewsStatus } from '../../entities';
import { AiConfig } from './config/ai.config';
import { GenerateNewsDto } from './dto/generate-news.dto';
import { RssFetcherService, RssArticle } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { normalizeUrl } from '../../utils/normalizeUrl';
import { AiRewriteResult } from '../../types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private aiConfig: AiConfig,
    private rssFetcher: RssFetcherService,
    private deduplicationService: DeduplicationService,
  ) {
    if (this.aiConfig.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.aiConfig.apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      });
    }
  }

  /**
   * Ручной запуск генерации по всем категориям
   */
  async autoGenerateManually(countPerCategory: number = 1) {
    this.logger.log(`🚀 Manual generation: ${countPerCategory} news per category`);

    const categories = this.aiConfig.categories;
    const results: { [key: string]: number } = {};
    let totalGenerated = 0;

    for (const category of categories) {
      try {
        this.logger.log(`📰 Generating ${countPerCategory} news for: ${category}`);

        const result = await this.generateNews({
          category: category as NewsCategory,
          count: countPerCategory,
        });

        results[category] = result.news.length;
        totalGenerated += result.news.length;

        this.logger.log(`✅ ${category}: ${result.news.length} news generated`);
        await this.delay(5000);
      } catch (error) {
        this.logger.error(`Failed for ${category}: ${error.message}`);
        results[category] = 0;
      }
    }

    return {
      message: `Generated ${totalGenerated} news across ${categories.length} categories`,
      totalGenerated,
      byCategory: results,
    };
  }

  @Cron(CronExpression.EVERY_6_HOURS, {
    timeZone: 'Europe/Moscow',
  })
  async autoGenerateNews() {
    this.logger.log('🚀 Starting automatic news generation...');
    return this.autoGenerateManually(2); // По 2 новости на категорию
  }

  async generateNews(dto: GenerateNewsDto) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const count = dto.count || 1;
    const selectedCategory = dto.category || this.getRandomCategory();

    this.logger.log(`📰 Fetching RSS articles for category: ${selectedCategory}`);

    // Берём с запасом, потому что часть отсеется как дубли
    const articles = await this.rssFetcher.fetchNewsByCategory(selectedCategory, count * 2);

    if (!articles || articles.length === 0) {
      this.logger.warn(`No RSS articles found for ${selectedCategory}`);
      return {
        message: 'No articles found in RSS sources',
        news: [],
      };
    }

    this.logger.log(`📥 Got ${articles.length} articles from RSS`);

    // Локальная защита от дублей внутри одной пачки
    const uniqueArticles: RssArticle[] = [];
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();

    for (const article of articles) {
      const normalizedUrl = normalizeUrl(article.link);
      const normalizedTitle = this.normalizeText(article.title);

      if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitle)) {
        this.logger.warn(`⏭️ Duplicate in RSS batch: "${article.title.substring(0, 80)}..."`);
        continue;
      }

      // Проверка по БД до AI
      const duplicate = await this.deduplicationService.checkDuplicate({
        title: article.title,
        sourceUrl: article.link,
        summary: article.summary,
        content: article.content,
      });

      if (duplicate.isDuplicate) {
        this.logger.warn(`⏭️ Duplicate in DB (${duplicate.reason}): "${article.title.substring(0, 80)}..."`);
        continue;
      }

      uniqueArticles.push(article);
      seenUrls.add(normalizedUrl);
      seenTitles.add(normalizedTitle);

      if (uniqueArticles.length >= count) {
        break;
      }
    }

    this.logger.log(`🔍 ${uniqueArticles.length} unique articles after dedup`);

    const generatedNews = [];

    for (const article of uniqueArticles) {
      try {
        // rewriteArticle должен вернуть draft, а не сохранять сам
        const draft = await this.rewriteArticle(article, selectedCategory);

        if (!draft) {
          continue;
        }

        // Повторная проверка уже по итоговой новости
        const finalDuplicate = await this.deduplicationService.checkDuplicate({
          title: draft.title,
          sourceUrl: article.link,
          summary: draft.summary,
          content: draft.content,
        });

        if (finalDuplicate.isDuplicate) {
          this.logger.warn(`⏭️ Duplicate after rewrite (${finalDuplicate.reason}): "${draft.title.substring(0, 80)}..."`);
          continue;
        }

        const news = this.newsRepository.create({
          title: draft.title,
          content: draft.content,
          summary: draft.summary,
          category: draft.category || selectedCategory,
          tags: draft.tags || article.categories || [],
          imageUrl: article.imageUrl || this.generateImageUrl(selectedCategory),
          source: article.source,
          sourceUrl: article.link,
          isAiGenerated: true,
          status: NewsStatus.PENDING,
          publishedAt: new Date(),
        });

        try {
          const saved = await this.newsRepository.save(news);
          generatedNews.push(saved);
          this.logger.log(`✅ News generated: ${saved.title}`);
        } catch (error: any) {
          // Защита от race condition / unique index violation
          if (this.isUniqueViolation(error)) {
            this.logger.warn(`⏭️ Unique constraint violation, skipping: "${draft.title.substring(0, 80)}..."`);
            continue;
          }

          throw error;
        }

        await this.delay(2000);
      } catch (error: any) {
        this.logger.error(`Failed to generate article: ${error.message}`);
      }
    }

    return {
      message: `Generated ${generatedNews.length} of ${count} news articles`,
      news: generatedNews,
    };
  }

  private async rewriteArticle(article: RssArticle, category: NewsCategory) {
    const prompt = `Сделай рерайт новости на русском языке. Сохрани все факты, но полностью измени формулировки и структуру текста.

    ОРИГИНАЛЬНАЯ НОВОСТЬ:
    Заголовок: ${article.title}
    Источник: ${article.source}
    Текст: ${article.content?.substring(0, 1500) || article.summary}
    
    Создай новую статью в формате JSON:
    {
      "title": "Новый заголовок (до 100 символов)",
      "summary": "Краткое описание (2-3 предложения)",
      "content": "Полный текст новости в формате HTML с абзацами <p>",
      "tags": ["тег1", "тег2", "тег3"],
      "category": "politics|economy|technology|science|sports|entertainment|health|world"
    }
    
    Важно:
    - Сохрани все факты и цифры из оригинала
    - Измени структуру и формулировки
    - Используй профессиональный журналистский стиль
    - Категория должна быть одной из: politics, economy, technology, science, sports, entertainment, health, world
    - Ответ строго в формате JSON`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.aiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'Ты профессиональный журналист и редактор. Твоя задача — делать качественный рерайт новостей на русском языке, сохраняя факты. Отвечай только валидным JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_completion_tokens: this.aiConfig.maxTokens,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';

      let result: AiRewriteResult = {
        title: '',
        summary: '',
        content: '',
        category: '',
        tags: [],
      };

      try {
        result = JSON.parse(rawContent) as AiRewriteResult;
      } catch {
        this.logger.error('Failed to parse AI response, trying to fix...');

        const fixedContent = rawContent.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\\/g, '\\\\');

        try {
          result = JSON.parse(fixedContent) as AiRewriteResult;
        } catch {
          const titleMatch = rawContent.match(/"title"\s*:\s*"([^"]+)"/);
          const summaryMatch = rawContent.match(/"summary"\s*:\s*"([^"]+)"/);
          const contentMatch = rawContent.match(/"content"\s*:\s*"([^"]+)"/s);
          const categoryMatch = rawContent.match(/"category"\s*:\s*"([^"]+)"/);
          const tagsMatch = rawContent.match(/"tags"\s*:\s*\[(.*?)\]/s);

          result = {
            title: titleMatch?.[1] || article.title,
            summary: summaryMatch?.[1] || article.summary || '',
            content: contentMatch?.[1] || article.content || article.summary || '',
            category: categoryMatch?.[1] || category,
            tags: tagsMatch
              ? tagsMatch[1]
                  .split(',')
                  .map((t: string) => t.replace(/"/g, '').trim())
                  .filter(Boolean)
              : [],
          };

          this.logger.warn('Using fallback extraction from malformed JSON');
        }
      }

      const finalTitle = (result.title || article.title || '').trim();
      const finalSummary = (result.summary || article.summary || '').trim();
      const finalContent = (result.content || article.content || article.summary || '').trim();
      const finalCategory = this.validateCategory(result.category) || category;
      const finalTags = Array.isArray(result.tags) && result.tags.length > 0 ? result.tags : article.categories || [];

      // Валидация контента
      const contentText = finalContent.replace(/<[^>]*>/g, '').trim();
      if (contentText.length < 50) {
        this.logger.warn(`⏭️ Content too short (${contentText.length} chars): "${contentText.substring(0, 50)}..."`);
        return null;
      }

      // Валидация заголовка
      if (!finalTitle || finalTitle.includes('Контент находится в процессе генерации') || finalTitle.includes('Актуальные новости')) {
        this.logger.warn(`⏭️ Invalid title: "${finalTitle}"`);
        return null;
      }

      // Валидация fallback-контента
      if (contentText.includes('Контент находится в процессе генерации') || contentText.includes('временно недоступен')) {
        this.logger.warn('⏭️ Fallback content detected');
        return null;
      }

      return {
        title: finalTitle,
        summary: finalSummary,
        content: finalContent,
        category: finalCategory,
        tags: finalTags,
      };
    } catch (error: any) {
      this.logger.error(`Failed to rewrite article: ${error.message}`);

      // Fallback: возвращаем оригинальную новость в более чистом виде
      let cleanContent = article.content || article.summary || '';

      cleanContent = cleanContent.replace(/<[^>]*>/g, '');
      cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

      const paragraphs = cleanContent
        .split(/\.\s+/)
        .filter((p) => p.trim().length > 10)
        .map((p) => `<p>${p.trim()}.</p>`)
        .join('');

      if (cleanContent.length < 50) {
        this.logger.warn(`⏭️ Original content too short (${cleanContent.length} chars), skipping`);
        return null;
      }

      return {
        title: article.title.replace(/<[^>]*>/g, '').trim(),
        summary: (article.summary || '')
          .replace(/<[^>]*>/g, '')
          .trim()
          .substring(0, 200),
        content: paragraphs || `<p>${cleanContent}</p>`,
        category,
        tags: article.categories || [],
      };
    }
  }

  private validateCategory(cat?: string): NewsCategory | null {
    if (!cat) return null;
    const valid = Object.values(NewsCategory);
    return valid.includes(cat as NewsCategory) ? (cat as NewsCategory) : null;
  }

  private async generateTitle(category: string, topic?: string): Promise<string> {
    const prompt = topic
      ? `${this.aiConfig.prompts.title}\nCategory: ${category}\nTopic: ${topic}`
      : `${this.aiConfig.prompts.title}\nCategory: ${category}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.aiConfig.model,
        messages: [
          { role: 'system', content: 'You are a professional news editor for a Russian news portal.' },
          { role: 'user', content: prompt },
        ],
        temperature: this.aiConfig.temperature,
        max_tokens: 100,
      });

      return completion.choices[0]?.message?.content?.trim() || `Новости ${category}: ${new Date().toLocaleDateString('ru-RU')}`;
    } catch {
      return `Актуальные новости ${category}`;
    }
  }

  private generateImageUrl(category: NewsCategory): string {
    // SVG иконки в base64 для каждой категории
    const icons: Record<string, string> = {
      [NewsCategory.TECHNOLOGY]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <rect x="80" y="60" width="240" height="100" rx="8" fill="#16213e" stroke="#0f3460" stroke-width="2"/>
          <rect x="100" y="70" width="200" height="8" rx="4" fill="#0f3460"/>
          <rect x="100" y="85" width="160" height="8" rx="4" fill="#0f3460"/>
          <rect x="100" y="100" width="180" height="8" rx="4" fill="#0f3460"/>
          <rect x="100" y="115" width="140" height="8" rx="4" fill="#0f3460"/>
          <circle cx="320" cy="160" r="20" fill="#e94560"/>
          <text x="310" y="167" font-size="16" fill="white" font-family="Arial">⚡</text>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.POLITICS]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <rect x="60" y="30" width="280" height="140" rx="4" fill="#16213e" stroke="#0f3460" stroke-width="2"/>
          <rect x="80" y="50" width="240" height="100" rx="2" fill="#1a1a2e"/>
          <text x="200" y="110" text-anchor="middle" font-size="40" fill="#e94560" font-family="Arial">🏛</text>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.ECONOMY]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <polyline points="60,150 140,90 220,130 300,50 340,70" stroke="#00b894" stroke-width="4" fill="none" stroke-linecap="round"/>
          <circle cx="300" cy="50" r="6" fill="#00b894"/>
          <line x1="60" y1="160" x2="340" y2="160" stroke="#0f3460" stroke-width="2"/>
          <line x1="60" y1="160" x2="60" y2="30" stroke="#0f3460" stroke-width="2"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.SCIENCE]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <circle cx="200" cy="100" r="50" fill="none" stroke="#6c5ce7" stroke-width="2" stroke-dasharray="8,4"/>
          <circle cx="180" cy="85" r="8" fill="#6c5ce7"/>
          <circle cx="220" cy="80" r="4" fill="#a29bfe"/>
          <circle cx="210" cy="110" r="5" fill="#a29bfe"/>
          <circle cx="170" cy="110" r="3" fill="#6c5ce7"/>
          <line x1="200" y1="140" x2="200" y2="170" stroke="#6c5ce7" stroke-width="2"/>
          <line x1="170" y1="155" x2="230" y2="155" stroke="#6c5ce7" stroke-width="2"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.SPORTS]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <circle cx="200" cy="100" r="45" fill="#16213e" stroke="#e17055" stroke-width="3"/>
          <line x1="200" y1="55" x2="200" y2="145" stroke="#e17055" stroke-width="2"/>
          <line x1="155" y1="100" x2="245" y2="100" stroke="#e17055" stroke-width="2"/>
          <circle cx="200" cy="100" r="8" fill="#e17055"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.ENTERTAINMENT]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <rect x="100" y="40" width="200" height="120" rx="4" fill="#16213e" stroke="#fdcb6e" stroke-width="2"/>
          <polygon points="175,70 225,90 175,110" fill="#fdcb6e"/>
          <rect x="120" y="130" width="160" height="6" rx="3" fill="#2d3436"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.HEALTH]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <rect x="170" y="50" width="60" height="100" rx="30" fill="#16213e" stroke="#e74c3c" stroke-width="3"/>
          <rect x="150" y="70" width="100" height="60" rx="30" fill="#16213e" stroke="#e74c3c" stroke-width="3"/>
          <circle cx="200" cy="100" r="15" fill="#e74c3c"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.WORLD]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <circle cx="200" cy="100" r="55" fill="#16213e" stroke="#0984e3" stroke-width="2"/>
          <ellipse cx="200" cy="100" rx="30" ry="55" fill="none" stroke="#0984e3" stroke-width="1" opacity="0.5"/>
          <line x1="145" y1="100" x2="255" y2="100" stroke="#0984e3" stroke-width="1" opacity="0.5"/>
          <line x1="200" y1="45" x2="200" y2="155" stroke="#0984e3" stroke-width="1" opacity="0.5"/>
        </svg>
      `,
        ).toString('base64'),

      [NewsCategory.OTHER]:
        'data:image/svg+xml;base64,' +
        Buffer.from(
          `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#1a1a2e"/>
          <rect x="100" y="60" width="200" height="100" rx="8" fill="#16213e" stroke="#636e72" stroke-width="2"/>
          <line x1="130" y1="80" x2="270" y2="80" stroke="#636e72" stroke-width="2" stroke-linecap="round"/>
          <line x1="130" y1="95" x2="250" y2="95" stroke="#636e72" stroke-width="2" stroke-linecap="round"/>
          <line x1="130" y1="110" x2="230" y2="110" stroke="#636e72" stroke-width="2" stroke-linecap="round"/>
          <line x1="130" y1="125" x2="210" y2="125" stroke="#636e72" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
        ).toString('base64'),
    };

    return icons[category] || icons[NewsCategory.OTHER];
  }

  private getRandomCategory(): NewsCategory {
    const categories = Object.values(NewsCategory);
    return categories[Math.floor(Math.random() * categories.length)];
  }

  async checkAvailability(): Promise<{ available: boolean; message: string }> {
    if (!this.aiConfig.apiKey) {
      return { available: false, message: 'OpenAI API key not configured.' };
    }

    try {
      await this.openai.chat.completions.create({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      return { available: true, message: 'AI service is available and working' };
    } catch (error) {
      return { available: false, message: `AI service error: ${error.message}` };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isUniqueViolation(error: any): boolean {
    // PostgreSQL unique violation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return error?.code === '23505' || error?.driverError?.code === '23505';
  }
}
