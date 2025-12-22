import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createCanvas,
  loadImage,
  CanvasRenderingContext2D,
} from '@napi-rs/canvas';
import * as fs from 'fs';
import * as path from 'path';
import { CardTemplate } from '@prisma/client';
import sharp from 'sharp';

@Injectable()
export class CardGeneratorService {
  private readonly cardsDir = path.join(process.cwd(), 'public', 'cards');
  private readonly backgroundsDir = path.join(process.cwd(), 'public', 'backgrounds');
  
  // Fallback фоновые изображения из надежных источников
  private readonly fallbackBackgrounds = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ];

  constructor() {
    if (!fs.existsSync(this.cardsDir)) {
      fs.mkdirSync(this.cardsDir, { recursive: true });
    }
  }

  async generateCard(
    template: CardTemplate,
    employeeName: string,
    employeePhotoUrl?: string,
    includeEmployeePhoto: boolean = false,
  ): Promise<string> {
    try {
      let canvas: any;
      let ctx: any;

      // Если есть фоновое изображение, проверяем его и пытаемся загрузить
      if (template.backgroundImageUrl) {
        try {
          // Проверяем валидность URL
          new URL(template.backgroundImageUrl);
          console.log(
            `Загрузка фонового изображения: ${template.backgroundImageUrl}`,
          );

          const background = await loadImage(template.backgroundImageUrl);
          canvas = createCanvas(background.width, background.height);
          ctx = canvas.getContext('2d');
          ctx.drawImage(background, 0, 0);
          console.log('Фоновое изображение успешно загружено');
        } catch (imageError) {
          console.error(
            'Детали ошибки загрузки фонового изображения:',
            {
              url: template.backgroundImageUrl,
              error: imageError.message,
              stack: imageError.stack,
            },
          );

          // Проверяем, является ли URL внешним или локальным путем
          const isExternalUrl =
            template.backgroundImageUrl.startsWith('http://') ||
            template.backgroundImageUrl.startsWith('https://');

          // Если это внешний URL и он недоступен, пробуем fallback изображения
          if (isExternalUrl) {
            console.log('Внешний URL недоступен, пробуем fallback изображения');
            
            // Пробуем загрузить fallback изображения
            for (const fallbackUrl of this.fallbackBackgrounds) {
              try {
                console.log(`Пробуем fallback изображение: ${fallbackUrl}`);
                const fallbackBackground = await loadImage(fallbackUrl);
                canvas = createCanvas(fallbackBackground.width, fallbackBackground.height);
                ctx = canvas.getContext('2d');
                ctx.drawImage(fallbackBackground, 0, 0);
                console.log('Fallback изображение успешно загружено');
                break; // Если успешно, выходим из цикла
              } catch (fallbackError) {
                console.warn(`Fallback изображение недоступно: ${fallbackUrl}`, fallbackError.message);
                continue; // Пробуем следующее
              }
            }
            
            // Если ни одно fallback изображение не загрузилось, используем градиент
            if (!canvas) {
              console.log('Все fallback изображения недоступны, используем градиентный фон');

              // Fallback: используем красивый градиентный фон
              canvas = createCanvas(800, 600);
              ctx = canvas.getContext('2d');

              // Создаем градиент
              const gradient = ctx.createLinearGradient(0, 0, 800, 600);
              gradient.addColorStop(0, '#4F46E5');
              gradient.addColorStop(0.5, '#7C3AED');
              gradient.addColorStop(1, '#DB2777');

              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            // Это локальный путь, пробуем загрузить из папки public
            try {
              const publicPath = path.join(
                process.cwd(),
                'public',
                template.backgroundImageUrl.replace(/^\//, ''),
              );
              if (fs.existsSync(publicPath)) {
                console.log(
                  `Попытка загрузки фонового изображения из public: ${publicPath}`,
                );
                const background = await loadImage(publicPath);
                canvas = createCanvas(background.width, background.height);
                ctx = canvas.getContext('2d');
                ctx.drawImage(background, 0, 0);
                console.log('Фоновое изображение из public успешно загружено');
              } else {
                throw new Error(`Файл не найден: ${publicPath}`);
              }
            } catch (publicError) {
              console.error(
                'Не удалось загрузить фоновое изображение из public:',
                publicError.message,
              );
              console.log(
                'Используем градиентный фон вместо фонового изображения',
              );

              // Fallback: используем красивый градиентный фон
              canvas = createCanvas(800, 600);
              ctx = canvas.getContext('2d');

              // Создаем градиент
              const gradient = ctx.createLinearGradient(0, 0, 800, 600);
              gradient.addColorStop(0, '#4F46E5');
              gradient.addColorStop(0.5, '#7C3AED');
              gradient.addColorStop(1, '#DB2777');

              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
      } else {
        // Если нет фонового изображения, создаем красивый градиентный фон
        canvas = createCanvas(800, 600);
        ctx = canvas.getContext('2d');

        // Создаем градиент
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(0.5, '#7C3AED');
        gradient.addColorStop(1, '#DB2777');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ОТЛАДКА: Логируем параметры текста
      console.log('=== ОТЛАДКА ТЕКСТА ===');
      console.log(`Исходный шаблон: "${template.textTemplate}"`);
      console.log(`Имя сотрудника: "${employeeName}"`);
      console.log(`Размер шрифта: ${template.fontSize}px`);
      console.log(`Цвет шрифта: ${template.fontColor}`);
      console.log(`Позиция X: ${template.textX}`);
      console.log(`Позиция Y: ${template.textY}`);
      console.log(`Размер canvas: ${canvas.width}x${canvas.height}`);
      
      const textLines = template.textTemplate
        .replace('{name}', employeeName)
        .split('\n');
        
      console.log(`Обработанные строки:`, textLines);
      
      ctx.font = `${template.fontSize}px Arial`;
      ctx.fillStyle = template.fontColor;
      ctx.textAlign = 'left';
      
      console.log('=== END ОТЛАДКА ===\n');

      let currentY = template.textY;
      const lineHeight = template.fontSize * 1.2;

      textLines.forEach((line) => {
        ctx.fillText(line.trim(), template.textX, currentY);
        currentY += lineHeight;
      });

      // Добавляем фото сотрудника если включено и URL указан
      if (includeEmployeePhoto && employeePhotoUrl) {
        try {
          const employeePhoto = await loadImage(employeePhotoUrl);
          const photoSize = 100; // размер фото
          const photoX = canvas.width - photoSize - 50; // правый верхний угол
          const photoY = 50;

          // Рисуем круглую рамку для фото
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            photoX + photoSize / 2,
            photoY + photoSize / 2,
            photoSize / 2,
            0,
            2 * Math.PI,
          );
          ctx.clip();
          ctx.drawImage(employeePhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          console.log('Фото сотрудника добавлено в открытку');
        } catch (photoError) {
          console.warn(
            'Не удалось добавить фото сотрудника в открытку:',
            photoError.message,
          );
        }
      }

      // Исправленная часть: добавляем await
      const buffer = await canvas.encode('png');

      // Теперь sharp получает настоящий Buffer
      const optimizedBuffer = await sharp(buffer).png({ quality: 90 }).toBuffer();

      const fileName = `card_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      const filePath = path.join(this.cardsDir, fileName);

      fs.writeFileSync(filePath, optimizedBuffer);

      return `http://localhost:3000/cards/${fileName}`;
    } catch (error) {
      console.error('Ошибка генерации открытки:', error.message || error);
      throw new InternalServerErrorException(
        `Не удалось сгенерировать открытку: ${error.message || 'Неизвестная ошибка'}`,
      );
    }
  }
}
