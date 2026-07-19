import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Header,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { NewsStatus } from '../../entities'
import { escapeXml } from '../../utils/escapeXml'



@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private newsService: NewsService,
    private authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получение списка новостей' })
  findAll(@Query() filters: any) {
    return this.newsService.findAll(filters);
  }

  @Get('stats-news')
  @ApiOperation({ summary: 'Статистика новостей' })
  async getNewsStats() {
    return this.newsService.getStats();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Полная статистика для главной' })
  async getStats() {
    const [newsStats, totalUsers] = await Promise.all([
      this.newsService.getStats(),
      this.authService.getTotalUsers(),
    ]);
    newsStats.totalUsers = totalUsers;
    return newsStats;
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getFavorites(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.newsService.getFavorites(req.user.id, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator', 'user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание новости' })
  create(@Body() createNewsDto: CreateNewsDto, @Request() req) {
    return this.newsService.create(createNewsDto, req.user.id);
  }

  @Post('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение персонализированных новостей' })
  findPersonalized(@Body('preferences') preferences: string[]) {
    return this.newsService.findPersonalized(preferences);
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap() {
    const news = await this.newsService.findAll({
      status: NewsStatus.PUBLISHED,
      limit: 1000,
    });

    const baseUrl = process.env.SITE_URL || 'http://localhost:5173';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
                  <url>
                    <loc>${baseUrl}</loc>
                    <changefreq>hourly</changefreq>
                    <priority>1.0</priority>
                  </url>
                  <url>
                    <loc>${baseUrl}/news</loc>
                    <changefreq>hourly</changefreq>
                    <priority>0.9</priority>
                  </url>
                    ${news.data.map((item) => `
                    <url>
                      <loc>${baseUrl}/?news=${item.id}</loc>
                      <lastmod>${new Date(item.publishedAt).toISOString()}</lastmod>
                      <changefreq>daily</changefreq>
                      <priority>0.8</priority>
                      <news:news>
                        <news:publication>
                          <news:name>News Portal</news:name>
                          <news:language>ru</news:language>
                        </news:publication>
                        <news:publication_date>${new Date(item.publishedAt).toISOString()}</news:publication_date>
                        <news:title>${escapeXml(item.title)}</news:title>
                        <news:keywords>${escapeXml(item.tags?.join(', ') || '')}</news:keywords>
                      </news:news>
                    </url>
                    `).join('')}
                </urlset>`;

    return xml;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение новости по ID' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Get(':id/favorite/check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async checkFavorite(@Param('id') id: string, @Request() req) {
    const favorited = await this.newsService.isFavorited(req.user.id, id);
    return { favorited };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление новости' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.newsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление новости' })
  delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Модерация новости' })
  moderate(
    @Param('id') id: string,
    @Body() moderationData: any,
    @Request() req,
  ) {
    return this.newsService.moderate(
      id,
      moderationData.status,
      req.user.id,
      moderationData.comment,
    );
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Лайк/дизлайк новости' })
  async like(@Param('id') id: string, @Request() req) {
    return this.newsService.like(req.user.id, id);
  }

  @Get(':id/like/check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async checkLike(@Param('id') id: string, @Request() req) {
    const liked = await this.newsService.isLiked(req.user.id, id);
    return { liked };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.newsService.toggleFavorite(req.user.id, id);
  }
}