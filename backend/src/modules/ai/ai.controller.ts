import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateNewsDto } from './dto/generate-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('generate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Генерация новостей с помощью AI',
        description: 'Генерирует новости используя OpenAI API. Доступно только администраторам и модераторам.'
    })
    @ApiResponse({ status: 201, description: 'Новости успешно сгенерированы' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Недостаточно прав' })
    generateNews(@Body() dto: GenerateNewsDto) {
        return this.aiService.generateNews(dto);
    }

    @Get('status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Проверка доступности AI сервиса' })
    @ApiResponse({ status: 200, description: 'Статус AI сервиса' })
    checkStatus() {
        return this.aiService.checkAvailability();
    }
}