import { ApiProperty } from '@nestjs/swagger';

export class NewsStatsDto {
    @ApiProperty({ example: 24, description: 'Новостей сегодня' })
    newsToday: number;

    @ApiProperty({ example: 1523, description: 'Всего пользователей' })
    totalUsers: number;

    @ApiProperty({ example: 856, description: 'AI-рерайт новостей всего' })
    totalAiNews: number;

    @ApiProperty({ example: 5, description: 'Новостей на модерации' })
    pendingNews: number;

    @ApiProperty({ example: 12, description: 'Новостей за последний час' })
    newsLastHour: number;

    @ApiProperty({ example: 3, description: 'Активных источников' })
    activeSources: number;

    @ApiProperty({ example: 1280, description: 'Новостей всего' })
    totalNews: number;

    @ApiProperty({ example: 45600, description: 'Всего просмотров' })
    totalViews: number;

    @ApiProperty({ example: 8, description: 'Категорий новостей' })
    categoriesCount: number;
}