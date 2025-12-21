import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // Инициализация ролей
  const authService = app.get(AuthService);
  await authService.seedRoles();

  await app.listen(3000);
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/cards/',
  });
}
bootstrap();
