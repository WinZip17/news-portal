import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { NewsCategory, NewsStatus } from '../../../types';

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class NewsFilterQueryDto {
  @ApiPropertyOptional({ enum: NewsCategory })
  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;

  @ApiPropertyOptional({ enum: NewsStatus })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-08-02', description: 'Начало периода (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(CALENDAR_DATE, { message: 'fromDate must be in YYYY-MM-DD format' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-09-13', description: 'Конец периода включительно (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(CALENDAR_DATE, { message: 'toDate must be in YYYY-MM-DD format' })
  toDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isAiGenerated?: boolean;

  @ApiPropertyOptional({ description: 'Только новости с непустым imageUrl' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  hasImage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ['publishedAt', 'views', 'likes', 'createdAt'] })
  @IsOptional()
  @IsString()
  sortBy?: 'publishedAt' | 'views' | 'likes' | 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'] as const)
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Comma-separated tags' })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((tag) => tag.trim()).filter(Boolean);
    return undefined;
  })
  @IsString({ each: true })
  tags?: string[];
}
