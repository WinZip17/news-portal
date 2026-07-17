import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsCategory } from '../../../entities/news.entity';

export class GenerateNewsDto {
    @ApiPropertyOptional({
        enum: NewsCategory,
        description: 'Категория для генерации новости'
    })
    @IsEnum(NewsCategory)
    @IsOptional()
    category?: NewsCategory;

    @ApiPropertyOptional({
        description: 'Тема для генерации новости'
    })
    @IsString()
    @IsOptional()
    topic?: string;

    @ApiPropertyOptional({
        description: 'Количество новостей для генерации',
        default: 1
    })
    @IsOptional()
    count?: number = 1;
}