import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/cards/',
  });

  // CORS для фронтенда
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://second-pmm-front.vercel.app',
      'https://second-pmm-front-17k9wc2l3-dks2006-cryptos-projects.vercel.app',
      /\.vercel\.app$/, // Разрешить все поддомены Vercel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Инициализация ролей
  const authService = app.get(AuthService);
  await authService.seedRoles();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // ДОБАВЛЕНО: '0.0.0.0'
  console.log(`Application is running on port ${port}`);
}
bootstrap();
