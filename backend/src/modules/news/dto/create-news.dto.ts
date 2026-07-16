import {
    IsString,
    IsEnum,
    IsOptional,
    IsArray,
    IsBoolean,
    IsUrl,
    MinLength,
    MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsCategory } from '../../../entities/news.entity';

export class CreateNewsDto {
    @ApiProperty({
        example: 'Заголовок новости',
        description: 'Заголовок новости (10-200 символов)'
    })
    @IsString({ message: 'Заголовок должен быть строкой' })
    @MinLength(10, { message: 'Заголовок должен содержать минимум 10 символов' })
    @MaxLength(200, { message: 'Заголовок должен содержать максимум 200 символов' })
    title: string;

    @ApiProperty({
        example: 'Содержание новости...',
        description: 'Основной текст новости'
    })
    @IsString({ message: 'Содержание должно быть строкой' })
    @MinLength(50, { message: 'Содержание должно содержать минимум 50 символов' })
    content: string;

    @ApiPropertyOptional({
        example: 'Краткое описание...',
        description: 'Краткое описание новости'
    })
    @IsString({ message: 'Описание должно быть строкой' })
    @IsOptional()
    @MaxLength(500, { message: 'Описание должно содержать максимум 500 символов' })
    summary?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/image.jpg',
        description: 'URL изображения'
    })
    @IsUrl({}, { message: 'Введите корректный URL изображения' })
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 'Название источника',
        description: 'Название источника'
    })
    @IsString({ message: 'Источник должен быть строкой' })
    @IsOptional()
    source?: string;

    @ApiPropertyOptional({
        example: 'https://source.com/article',
        description: 'URL источника'
    })
    @IsUrl({}, { message: 'Введите корректный URL источника' })
    @IsOptional()
    sourceUrl?: string;

    @ApiProperty({
        enum: NewsCategory,
        example: NewsCategory.TECHNOLOGY,
        description: 'Категория новости'
    })
    @IsEnum(NewsCategory, { message: 'Выберите корректную категорию' })
    category: NewsCategory;

    @ApiPropertyOptional({
        example: ['технологии', 'AI', 'инновации'],
        description: 'Теги новости'
    })
    @IsArray({ message: 'Теги должны быть массивом' })
    @IsString({ each: true, message: 'Каждый тег должен быть строкой' })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({
        example: false,
        description: 'Создано с помощью AI'
    })
    @IsBoolean({ message: 'isAiGenerated должен быть булевым значением' })
    @IsOptional()
    isAiGenerated?: boolean;
}