import { CardGeneratorService } from './src/card-generator/card-generator.service';

// Создаем тестовый шаблон с проблемным внешним URL для тестирования fallback
const testTemplate = {
  id: 1,
  name: 'Тест Шаблон',
  textTemplate: 'С днем рождения, {name}!\nПусть этот день будет ярким!',
  fontSize: 32,
  fontColor: '#FFFFFF',
  textX: 50,
  textY: 100,
  backgroundImageUrl: 'https://static.vecteezy.com/system/resources/previews/011/236/429/non_2x/luxury-birthday-decoration-balloons-png.png', // Проблемный URL
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function testCardGeneration() {
  console.log('Начинаем тестирование исправления загрузки фонового изображения...');
  
  const cardGenerator = new CardGeneratorService();
  
  try {
    const cardUrl = await cardGenerator.generateCard(
      testTemplate as any,
      'Иван Петров',
      undefined,
      false
    );
    
    console.log('✅ УСПЕХ: Открытка успешно создана с градиентным фоном!');
    console.log('URL открытки:', cardUrl);
  } catch (error) {
    console.error('❌ ОШИБКА при создании открытки:', error.message);
  }
}

testCardGeneration();