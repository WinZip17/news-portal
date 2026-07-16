import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

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
        }));

        // CORS
        app.enableCors({
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        });

        // Префикс API
        app.setGlobalPrefix('api');

        const port = process.env.PORT || 3001;

        await app.listen(port, '0.0.0.0');

        logger.log(`🚀 Application is running on: http://localhost:${port}`);
        logger.log(`📚 API: http://localhost:${port}/api`);

    } catch (error) {
        logger.error('❌ Failed to start application:', error.message);
        console.error(error);
    }
}

bootstrap();