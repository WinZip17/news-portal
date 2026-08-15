import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AiConfig } from '../ai/config/ai.config';
import { NewsService } from './news.service';
import { sanitizeNewsFilter } from './parse-news-filter';
import { NewsFilter, SmartSearchResponse } from '../../types';

interface ParsedQueryResult {
  filters: NewsFilter;
  source: 'ai' | 'fallback';
}

@Injectable()
export class NewsSearchAiService {
  private readonly logger = new Logger(NewsSearchAiService.name);
  private readonly openai: OpenAI | null;

  constructor(
    private readonly aiConfig: AiConfig,
    private readonly newsService: NewsService,
  ) {
    this.openai = this.aiConfig.apiKey
      ? new OpenAI({
          apiKey: this.aiConfig.apiKey,
          baseURL: 'https://api.deepseek.com/v1',
        })
      : null;
  }

  async search(query: string, page = 1, limit = 10): Promise<SmartSearchResponse> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      throw new BadRequestException('Пустой поисковый запрос');
    }

    const { filters, source } = await this.parseNaturalLanguageQuery(trimmedQuery);
    const result = await this.newsService.findAll({
      ...filters,
      page,
      limit,
    });

    return {
      ...result,
      appliedFilters: filters,
      source,
    } as unknown as SmartSearchResponse;
  }

  private async parseNaturalLanguageQuery(query: string): Promise<ParsedQueryResult> {
    if (!this.openai) {
      return {
        filters: sanitizeNewsFilter({}, query),
        source: 'fallback',
      };
    }

    const today = new Date().toISOString().slice(0, 10);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.aiConfig.model,
        temperature: 0.1,
        max_completion_tokens: 350,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Ты парсер поисковых запросов к новостному порталу. Преобразуй запрос пользователя в JSON-фильтры. Отвечай только валидным JSON без markdown.',
          },
          {
            role: 'user',
            content: `Сегодня: ${today} (UTC).

Запрос пользователя: "${query}"

Верни JSON:
{
  "search": "ключевые слова для полнотекстового поиска или null",
  "category": "politics|economy|technology|science|sports|entertainment|health|world|other|null",
  "tags": ["тег1", "тег2"],
  "fromDate": "ISO-8601 или null",
  "toDate": "ISO-8601 или null",
  "isAiGenerated": true|false|null,
  "sortBy": "publishedAt|views|likes|createdAt|null",
  "sortOrder": "ASC|DESC|null"
}

Правила:
- category только на английском из списка
- интерпретируй "за неделю", "за месяц", "вчера", "сегодня" в fromDate/toDate
- "AI новости" → isAiGenerated: true
- search — смысловые слова, не весь вопрос целиком
- не добавляй поля вне схемы`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw) as unknown;
      const filters = sanitizeNewsFilter(parsed, query);

      if (!filters.search && !filters.category && !filters.tags?.length && !filters.fromDate) {
        filters.search = query.slice(0, 200);
      }

      return { filters, source: 'ai' };
    } catch (error) {
      this.logger.warn(`Smart search AI parse failed, using fallback: ${(error as Error).message}`);
      return {
        filters: sanitizeNewsFilter({}, query),
        source: 'fallback',
      };
    }
  }
}
