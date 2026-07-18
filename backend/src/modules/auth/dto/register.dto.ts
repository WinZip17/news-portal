import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя'
  })
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Имя пользователя (3-30 символов)'
  })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MinLength(3, { message: 'Имя пользователя должно содержать минимум 3 символа' })
  @MaxLength(30, { message: 'Имя пользователя должно содержать максимум 30 символов' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание',
  })
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль (минимум 8 символов, должен содержать заглавные и строчные буквы, цифры)'
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную и одну цифру',
  })
  password: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Имя пользователя'
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Фамилия пользователя'
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsOptional()
  lastName?: string;
}