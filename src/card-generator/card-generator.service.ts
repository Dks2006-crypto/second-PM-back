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
  ): Promise<string> {
    try {
      const background = await loadImage(template.backgroundImageUrl);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(background, 0, 0);

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

      // Исправленная часть: добавляем await
      const buffer = await canvas.encode('png');

      // Теперь sharp получает настоящий Buffer
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 90 })
        .toBuffer();

      const fileName = `card_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      const filePath = path.join(this.cardsDir, fileName);

      fs.writeFileSync(filePath, optimizedBuffer);

      return `/cards/${fileName}`;
    } catch (error) {
      console.error('Ошибка генерации открытки:', error);
      throw new InternalServerErrorException(
        'Не удалось сгенерировать открытку',
      );
    }
  }
}
