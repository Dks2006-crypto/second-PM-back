import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import betterSqlite3 from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    let url = configService.get<string>('DATABASE_URL');

    // Fallback для production (Railway/Koyeb)
    if (!url) {
      url = process.env.DATABASE_URL || 'file:/app/data/dev.db';
    }

    console.log('Using DATABASE_URL:', url);

    // Проверяем что url определен
    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    const dbPath = url.replace(/^file:/, '');
    console.log('Database path:', dbPath);

    // Создаем директорию если ее нет
    const directory = path.dirname(dbPath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const db = new (betterSqlite3 as any)(dbPath);
    const adapter = new PrismaBetterSqlite3(db);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    // Подключение открывается автоматически
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}