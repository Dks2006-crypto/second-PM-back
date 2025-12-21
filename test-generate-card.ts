// test-generate-card.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CardGeneratorService } from './src/card-generator/card-generator.service';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const generator = app.get(CardGeneratorService);
  const prisma = app.get(PrismaService);

  // Замените на реальный id шаблона и имя сотрудника
  const templateId = 1;
  const employeeName = 'Алексей Иванов';

  const template = await prisma.cardTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    console.error('Шаблон не найден');
    return;
  }

  const imageUrl = await generator.generateCard(template, employeeName);

  console.log('Открытка сгенерирована!');
  console.log(`URL: http://localhost:3000${imageUrl}`);

  await app.close();
}

bootstrap();