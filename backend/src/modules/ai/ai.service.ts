// Каждый час
// @Cron(CronExpression.EVERY_HOUR)

// Каждые 30 минут
// @Cron('*/30 * * * *')

// Каждый день в 9:00 и 20:00
// @Cron('0 9,20 * * *')

// Каждые 2 часа
// @Cron('0 */2 * * *')

// Каждый день в полночь
// @Cron('0 0 * * *')

// @Cron('0 0 * * *')
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { News, NewsCategory, NewsStatus } from '../../entities/news.entity';
import { AiConfig } from './config/ai.config';
import { GenerateNewsDto } from './dto/generate-news.dto';
import { RssFetcherService, RssArticle } from './rss-fetcher.service';
import { DeduplicationService } from './deduplication.service';
import { NewsService } from '../news/news.service';

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
        private newsService: NewsService,
    ) {
        if (this.aiConfig.apiKey) {
            this.openai = new OpenAI({
                apiKey: this.aiConfig.apiKey,
                baseURL: 'https://api.deepseek.com/v1',
            });
        }
    }

    @Cron(CronExpression.EVERY_4_HOURS, {
        timeZone: 'Europe/Moscow'
    })
    async autoGenerateNews() {
        this.logger.log('🚀 Starting automatic news generation from RSS...');

        try {
            const categories = this.aiConfig.categories;
            const randomCategories = this.shuffleArray(categories).slice(0, 2);

            for (const category of randomCategories) {
                try {
                    await this.generateFromRss(category as NewsCategory);
                    await this.delay(5000);
                } catch (error) {
                    this.logger.error(`Failed to generate news for ${category}:`, error.message);
                }
            }

            this.logger.log('✅ Automatic news generation completed');
        } catch (error) {
            this.logger.error('Failed to auto generate news:', error.message);
        }
    }

    async generateNews(dto: GenerateNewsDto) {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        const count = dto.count || 1;
        const generatedNews = [];

        for (let i = 0; i < count; i++) {
            try {
                // Берем РАЗНЫЕ RSS статьи для каждой генерации
                const news = await this.generateFromRss(dto.category, dto.topic);
                if (news) {
                    generatedNews.push(news);
                }
                // Задержка между запросами
                await this.delay(2000);
            } catch (error) {
                this.logger.error(`Failed to generate news ${i + 1}:`, error.message);
            }
        }

        return {
            message: `Generated ${generatedNews.length} of ${count} news articles`,
            news: generatedNews,
        };
    }

    async generateFromRss(category?: NewsCategory, topic?: string) {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        const selectedCategory = category || this.getRandomCategory();

        // Получаем НЕСКОЛЬКО статей и выбираем случайную
        const articles = await this.rssFetcher.fetchNewsByCategory(selectedCategory, 10);

        if (!articles || articles.length === 0) {
            this.logger.warn(`No RSS articles found for ${selectedCategory}`);
            return null;
        }

        // Выбираем случайную статью из полученных
        const article = articles[Math.floor(Math.random() * articles.length)];

        // Проверяем на дубликат
        const duplicateCheck = await this.deduplicationService.checkDuplicate(
            article.title,
            article.content,
            article.source
        );

        if (duplicateCheck.isDuplicate) {
            this.logger.warn(`⚠️ Duplicate: "${article.title}"`);
            return null;
        }

        return this.rewriteArticle(article, selectedCategory);
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
      "content": "Полный текст новости в формате HTML с абзацами <p> (500-800 слов)",
      "tags": ["тег1", "тег2", "тег3"]
    }
    
    Важно:
    - Сохрани все факты и цифры из оригинала
    - Измени структуру и формулировки
    - Добавь контекст и анализ
    - Используй профессиональный журналистский стиль
    - Ответ строго в формате JSON`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.aiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Ты профессиональный журналист и редактор. Твоя задача - делать качественный рерайт новостей на русском языке, сохраняя факты и добавляя аналитику. Отвечай строго в формате JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: this.aiConfig.maxTokens,
                response_format: { type: 'json_object' },
            });

            const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

            const news = this.newsRepository.create({
                title: result.title || article.title,
                content: result.content || article.content,
                summary: result.summary || article.summary,
                category: category,
                tags: result.tags || article.categories || [],
                imageUrl: article.imageUrl || this.generateImageUrl(category),
                source: article.source,
                sourceUrl: article.link,
                isAiGenerated: true,
                status: NewsStatus.PENDING,
                publishedAt: new Date(),
            });

            const saved = await this.newsRepository.save(news);
            this.logger.log(`✅ News generated: ${saved.title}`);
            return saved;

        } catch (error) {
            this.logger.error('Failed to rewrite article:', error.message);

            // Сохраняем оригинал если AI не сработал
            // Очищаем HTML-теги и форматируем текст
            let cleanContent = article.content || article.summary || '';

            // Удаляем все HTML-теги
            cleanContent = cleanContent.replace(/<[^>]*>/g, '');

            // Удаляем множественные пробелы и переносы
            cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

            // Разбиваем на абзацы по точкам
            const paragraphs = cleanContent
                .split(/\.\s+/)
                .filter(p => p.trim().length > 10)
                .map(p => `<p>${p.trim()}.</p>`)
                .join('');

            const news = this.newsRepository.create({
                title: article.title.replace(/<[^>]*>/g, '').trim(),
                content: paragraphs || `<p>${cleanContent}</p>`,
                summary: (article.summary || '').replace(/<[^>]*>/g, '').trim().substring(0, 200),
                category: category,
                tags: article.categories || [],
                imageUrl: article.imageUrl || this.generateImageUrl(category),
                source: article.source,
                sourceUrl: article.link,
                isAiGenerated: false,
                status: NewsStatus.PENDING,
                publishedAt: new Date(),
            });

            return this.newsRepository.save(news);
        }
    }

    private async generateSingleNews(category?: NewsCategory, topic?: string) {
        const selectedCategory = category || this.getRandomCategory();
        const categoryName = this.getCategoryName(selectedCategory);

        const title = await this.generateTitle(categoryName, topic);
        const content = await this.generateContent(title, categoryName);
        const summary = await this.generateSummary(content);
        const tags = await this.generateTags(title, content);
        const imageUrl = this.generateImageUrl(selectedCategory);

        const news = this.newsRepository.create({
            title,
            content,
            summary,
            category: selectedCategory,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            imageUrl,
            isAiGenerated: true,
            status: NewsStatus.PENDING,
            source: 'AI Generated',
            publishedAt: new Date(),
        });

        return this.newsRepository.save(news);
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

            return completion.choices[0]?.message?.content?.trim() ||
                `Новости ${category}: ${new Date().toLocaleDateString('ru-RU')}`;
        } catch (error) {
            return `Актуальные новости ${category}`;
        }
    }

    private async generateContent(title: string, category: string): Promise<string> {
        const prompt = `${this.aiConfig.prompts.content}\nTitle: ${title}\nCategory: ${category}`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.aiConfig.model,
                messages: [
                    { role: 'system', content: 'You are a professional journalist writing for a Russian news portal.' },
                    { role: 'user', content: prompt },
                ],
                temperature: this.aiConfig.temperature,
                max_tokens: this.aiConfig.maxTokens,
            });

            return completion.choices[0]?.message?.content?.trim() ||
                `Новость: ${title}\n\nКонтент временно недоступен.`;
        } catch (error) {
            return `# ${title}\n\nКонтент находится в процессе генерации.`;
        }
    }

    private async generateSummary(content: string): Promise<string> {
        const prompt = `${this.aiConfig.prompts.summary}\n\nArticle:\n${content.substring(0, 500)}`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.aiConfig.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 200,
            });

            return completion.choices[0]?.message?.content?.trim() ||
                content.substring(0, 200) + '...';
        } catch (error) {
            return content.substring(0, 200) + '...';
        }
    }

    private async generateTags(title: string, content: string): Promise<string> {
        const prompt = `${this.aiConfig.prompts.tags}\nTitle: ${title}\nContent: ${content.substring(0, 300)}`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.aiConfig.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 50,
            });

            return completion.choices[0]?.message?.content?.trim() || '';
        } catch (error) {
            return '';
        }
    }

    private generateImageUrl(category: NewsCategory): string {
        const images: Record<string, string> = {
            [NewsCategory.TECHNOLOGY]: 'https://picsum.photos/seed/tech/800/400',
            [NewsCategory.SCIENCE]: 'https://picsum.photos/seed/science/800/400',
            [NewsCategory.POLITICS]: 'https://picsum.photos/seed/politics/800/400',
            [NewsCategory.ECONOMY]: 'https://picsum.photos/seed/economy/800/400',
            [NewsCategory.SPORTS]: 'https://picsum.photos/seed/sports/800/400',
            [NewsCategory.ENTERTAINMENT]: 'https://picsum.photos/seed/entertainment/800/400',
            [NewsCategory.HEALTH]: 'https://picsum.photos/seed/health/800/400',
            [NewsCategory.WORLD]: 'https://picsum.photos/seed/world/800/400',
            [NewsCategory.OTHER]: 'https://picsum.photos/seed/news/800/400',
        };
        return images[category] || images[NewsCategory.OTHER];
    }

    private getRandomCategory(): NewsCategory {
        const categories = Object.values(NewsCategory);
        return categories[Math.floor(Math.random() * categories.length)];
    }

    private getCategoryName(category: NewsCategory): string {
        const names: Record<string, string> = {
            [NewsCategory.TECHNOLOGY]: 'Технологии',
            [NewsCategory.SCIENCE]: 'Наука',
            [NewsCategory.POLITICS]: 'Политика',
            [NewsCategory.ECONOMY]: 'Экономика',
            [NewsCategory.SPORTS]: 'Спорт',
            [NewsCategory.ENTERTAINMENT]: 'Развлечения',
            [NewsCategory.HEALTH]: 'Здоровье',
            [NewsCategory.WORLD]: 'Мир',
            [NewsCategory.OTHER]: 'Другое',
        };
        return names[category] || 'Другое';
    }

    async checkAvailability(): Promise<{ available: boolean; message: string }> {
        if (!this.aiConfig.apiKey) {
            return { available: false, message: 'OpenAI API key not configured.' };
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'deepseek-v4-flash',
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5,
            });

            return { available: true, message: 'AI service is available and working' };
        } catch (error) {
            return { available: false, message: `AI service error: ${error.message}` };
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}