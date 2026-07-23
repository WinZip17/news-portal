import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Статика ДО контроллеров, но только для файлов
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false, // Не отдавать index.html автоматически
    setHeaders: (res, path) => {
      if (path.endsWith('.js') || path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    },
  });

  await app.listen(3002);
}
bootstrap();
