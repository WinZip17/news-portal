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

const SMART_SEARCH_SYSTEM_PROMPT = `Ты парсер поисковых запросов к русскоязычному новостному порталу.
Преобразуй запрос пользователя в JSON-фильтры для полнотекстового поиска.
Отвечай только валидным JSON без markdown.

Важно про search и searchVariants:
- search — ключевые слова для поиска (1–5 слов), без слов-паразитов («новости», «про», «о», «найди»).
- searchVariants — ВСЕ альтернативные написания имён, брендов, компаний, аббревиатур из запроса:
  • кириллица и латиница: Озон ↔ Ozon, Яндекс ↔ Yandex, Сбер ↔ Sber
  • разный регистр и транслит: iPhone ↔ Айфон, WhatsApp ↔ Ватсап
  • если пользователь пишет по-русски, всё равно добавь латинские варианты бренда в searchVariants
- searchVariants не дублирует обычные русские слова — только имена собственные, бренды, аббревиатуры.
- Если запрос только про бренд/компанию — search = основное слово, searchVariants = все написания.`;

const SMART_SEARCH_USER_PROMPT = (today: string, query: string) => `Сегодня: ${today} (UTC).

Запрос пользователя: "${query}"

Верни JSON:
{
  "search": "ключевые слова для полнотекстового поиска или null",
  "searchVariants": ["альтернативное написание 1", "альтернативное написание 2"],
  "category": "politics|economy|technology|science|sports|entertainment|health|world|other|null",
  "tags": ["тег1", "тег2"],
  "fromDate": "YYYY-MM-DD или null",
  "toDate": "YYYY-MM-DD или null",
  "isAiGenerated": true|false|null,
  "sortBy": "publishedAt|views|likes|createdAt|null",
  "sortOrder": "ASC|DESC|null"
}

Правила:
- category только на английском из списка
- интерпретируй «за неделю», «за месяц», «вчера», «сегодня» в fromDate/toDate
- «AI новости» → isAiGenerated: true
- пример: запрос «Озон» → search: "озон", searchVariants: ["Ozon", "ozon", "Озон"]
- пример: «новости про маркетплейс Ozon» → search: "маркетплейс ozon", searchVariants: ["Ozon", "озон", "Озон"]
- не добавляй поля вне схемы`;

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
        max_completion_tokens: 450,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: SMART_SEARCH_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: SMART_SEARCH_USER_PROMPT(today, query),
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
