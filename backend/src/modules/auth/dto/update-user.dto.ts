import { IsOptional, IsEnum, IsBoolean, IsString, IsEmail, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from "../../../entities";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'new_username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Настройки пользователя' })
  @IsOptional()
  @IsObject()
  preferences?: {
    categories?: string[];
    tags?: string[];
    language?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    theme?: 'light' | 'dark';
  };
}