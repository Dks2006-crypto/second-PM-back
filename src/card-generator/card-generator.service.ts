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
          console.log(`Загрузка фонового изображения: ${template.backgroundImageUrl}`);
          
          const background = await loadImage(template.backgroundImageUrl);
          canvas = createCanvas(background.width, background.height);
          ctx = canvas.getContext('2d');
          ctx.drawImage(background, 0, 0);
          console.log('Фоновое изображение успешно загружено');
        } catch (imageError) {
          console.warn(`Не удалось загрузить фоновое изображение ${template.backgroundImageUrl}:`, imageError.message);
          console.log('Используем белый фон вместо фонового изображения');
          
          // Fallback: используем белый фон
          canvas = createCanvas(800, 600);
          ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // Если нет фонового изображения, создаем белый фон
        canvas = createCanvas(800, 600);
        ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const textLines = template.textTemplate
        .replace('{name}', employeeName)
        .split('\n');

      ctx.font = `${template.fontSize}px Arial`;
      ctx.fillStyle = template.fontColor;
      ctx.textAlign = 'left';

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
          ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(employeePhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();
          
          console.log('Фото сотрудника добавлено в открытку');
        } catch (photoError) {
          console.warn('Не удалось добавить фото сотрудника в открытку:', photoError.message);
        }
      }

      // Исправленная часть: добавляем await
      const buffer = await canvas.encode('png');

      // Теперь sharp получает настоящий Buffer
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 90 })
        .toBuffer();

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
