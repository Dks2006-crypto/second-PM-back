import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTemplate() {
  console.log('=== ОТЛАДКА ШАБЛОНОВ ===\n');
  
  try {
    // Получаем все шаблоны
    const templates = await prisma.cardTemplate.findMany();
    
    console.log(`Найдено шаблонов: ${templates.length}\n`);
    
    templates.forEach((template, index) => {
      console.log(`--- Шаблон ${index + 1} ---`);
      console.log(`ID: ${template.id}`);
      console.log(`Название: ${template.name}`);
      console.log(`Текстовый шаблон: "${template.textTemplate}"`);
      console.log(`Размер шрифта: ${template.fontSize}px`);
      console.log(`Цвет шрифта: ${template.fontColor}`);
      console.log(`Позиция X: ${template.textX}`);
      console.log(`Позиция Y: ${template.textY}`);
      console.log(`Фоновое изображение: ${template.backgroundImageUrl || 'НЕТ'}`);
      // console.log(`Дата создания: ${template.createdAt}`);
      console.log('--- END ---\n');
    });
    
  } catch (error) {
    console.error('Ошибка при получении шаблонов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTemplate();