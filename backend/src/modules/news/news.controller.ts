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

@ApiTags('News')
@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создание новости' })
    create(@Body() createNewsDto: CreateNewsDto, @Request() req) {
        return this.newsService.create(createNewsDto, req.user.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Обновление новости' })
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.newsService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Удаление новости' })
    delete(@Param('id') id: string) {
        return this.newsService.delete(id);
    }

    @Patch(':id/moderate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    @ApiBearerAuth()
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Лайк новости' })
    like(@Param('id') id: string) {
        return this.newsService.like(id);
    }

    @Post('personalized')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получение персонализированных новостей' })
    findPersonalized(@Body('preferences') preferences: string[]) {
        return this.newsService.findPersonalized(preferences);
    }
}