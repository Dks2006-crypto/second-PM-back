import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTemplate() {
  console.log('=== ИСПРАВЛЕНИЕ ШАБЛОНА ===\n');
  
  try {
    // Получаем все шаблоны
    const templates = await prisma.cardTemplate.findMany();
    
    console.log(`Найдено шаблонов: ${templates.length}\n`);
    
    for (const template of templates) {
      console.log(`--- Шаблон ID: ${template.id} ---`);
      console.log(`Название: ${template.name}`);
      console.log(`Текстовый шаблон: "${template.textTemplate}"`);
      console.log(`Размер шрифта: ${template.fontSize}px`);
      console.log(`Цвет шрифта: ${template.fontColor}`);
      console.log(`Позиция X: ${template.textX}`);
      console.log(`Позиция Y: ${template.textY}`);
      console.log(`Фоновое изображение: ${template.backgroundImageUrl || 'НЕТ'}`);
      
      // Проверяем, является ли это тестовым шаблоном
      if (template.textTemplate.includes('ывавыаыава') || template.textTemplate === 'ывавыаыава') {
        console.log('🔧 ИСПРАВЛЯЕМ ТЕСТОВЫЙ ШАБЛОН...');
        
        // Обновляем шаблон на правильный
        const updatedTemplate = await prisma.cardTemplate.update({
          where: { id: template.id },
          data: {
            name: 'С днем рождения!',
            textTemplate: 'С днем рождения, {name}!\nПусть этот день будет ярким и незабываемым!',
            fontSize: 36, // Уменьшаем размер шрифта
            fontColor: '#FFFFFF',
            textX: 50,
            textY: 150, // Поднимаем текст выше
          },
        });
        
        console.log('✅ Шаблон исправлен!');
        console.log(`Новый текст: "${updatedTemplate.textTemplate}"`);
        console.log(`Новый размер шрифта: ${updatedTemplate.fontSize}px`);
        console.log(`Новая позиция Y: ${updatedTemplate.textY}`);
      } else {
        console.log('✅ Шаблон выглядит нормально');
      }
      
      console.log('--- END ---\n');
    }
    
  } catch (error) {
    console.error('Ошибка при исправлении шаблона:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplate();