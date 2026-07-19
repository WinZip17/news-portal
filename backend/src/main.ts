import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('🚀 Starting application...');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    logger.log('✅ Application created');

    // Глобальные пайпы
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    // CORS
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:80'],
      credentials: true,
    });

    // Префикс API
    app.setGlobalPrefix('api');

    // Swagger настройка
    const config = new DocumentBuilder()
      .setTitle('📰 News Portal API')
      .setDescription('API для новостного портала с AI-генерацией контента')
      .setVersion('1.0')
      .addTag('Auth', 'Аутентификация и авторизация')
      .addTag('News', 'Управление новостями')
      .addTag('Users', 'Управление пользователями')
      .addTag('Ai', 'Ai генерация')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Введите JWT токен',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer('http://localhost:3001', 'Локальный сервер')
      .addServer('http://short-news.ru/', 'Продакшн сервер')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: 'News Portal API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      customfavIcon: 'https://nestjs.com/img/favicon.png',
    });

    const port = process.env.PORT || 3001;

    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API: http://localhost:${port}/api`);
    logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);

  } catch (error) {
    logger.error('❌ Failed to start application:', error.message);
    console.error(error);
  }
}

bootstrap();