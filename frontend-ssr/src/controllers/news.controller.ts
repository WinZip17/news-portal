import { Controller, Get, Render, Query } from '@nestjs/common';
import axios from 'axios';

@Controller('news')
export class NewsController {
  @Get()
  @Render('news')
  async getNews(@Query('category') category?: string) {
    try {
      const response = await axios.get('http://localhost:3001/api/news', {
        params: { category, limit: 20 },
      });
      return {
        news: response.data.data,
        category: category || 'all',
        framework: 'nestjs',
      };
    } catch {
      return { news: [], category: 'all', framework: 'nestjs' };
    }
  }
}
