import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль (минимум 6 символов)',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Запомнить пользователя',
  })
  @IsBoolean({ message: 'rememberMe должен быть булевым значением' })
  @IsOptional()
  rememberMe?: boolean;
}
