import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiConfig {
    constructor(private configService: ConfigService) {}

    get apiKey(): string {
        return this.configService.get<string>('OPENAI_API_KEY', '');
    }

    get model(): string {
        return this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo');
    }

    get temperature(): number {
        return this.configService.get<number>('AI_TEMPERATURE', 0.7);
    }

    get maxTokens(): number {
        return this.configService.get<number>('AI_MAX_TOKENS', 1000);
    }

    get generationInterval(): number {
        return this.configService.get<number>('AI_GENERATION_INTERVAL', 3600000); // 1 час
    }

    get categories(): string[] {
        return [
            'technology',
            'science',
            'politics',
            'economy',
            'sports',
            'entertainment',
            'health',
            'world',
        ];
    }

    get prompts() {
        return {
            title: 'Generate a news title in Russian language. Should be catchy and informative, max 100 characters.',
            summary: 'Write a brief summary of the news in Russian, 2-3 sentences.',
            content: 'Write a detailed news article in Russian language. Include facts, context, and analysis. Format with paragraphs. Length: 500-800 words.',
            tags: 'Generate 3-5 relevant tags for this news article in Russian, comma separated.',
        };
    }
}