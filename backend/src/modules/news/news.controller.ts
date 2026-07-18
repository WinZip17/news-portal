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
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from "../auth/auth.service";


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

    @Get(':id')
    @ApiOperation({ summary: 'Получение новости по ID' })
    findOne(@Param('id') id: string) {
        return this.newsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator', 'user')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Создание новости' })
    create(@Body() createNewsDto: CreateNewsDto, @Request() req) {
        return this.newsService.create(createNewsDto, req.user.id);
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
    @ApiOperation({ summary: 'Лайк новости' })
    like(@Param('id') id: string) {
        return this.newsService.like(id);
    }

    @Post('personalized')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Получение персонализированных новостей' })
    findPersonalized(@Body('preferences') preferences: string[]) {
        return this.newsService.findPersonalized(preferences);
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
}