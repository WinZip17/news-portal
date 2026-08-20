import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiConfig {
  constructor(private configService: ConfigService) {}

  get apiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY', '');
  }

  get model(): string {
    return this.configService.get<string>('OPENAI_MODEL', 'deepseek-v4-flash');
  }

  get temperature(): number {
    return this.configService.get<number>('AI_TEMPERATURE', 0.7);
  }

  get maxTokens(): number {
    const value = this.configService.get('AI_MAX_TOKENS', 1000);
    return typeof value === 'string' ? parseInt(value, 10) : value;
  }

  get categories(): string[] {
    return ['technology', 'science', 'politics', 'economy', 'sports', 'entertainment', 'health', 'world'];
  }
}
