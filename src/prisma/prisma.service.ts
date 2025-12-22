import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import betterSqlite3 from 'better-sqlite3';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL') || 'file:./dev.db';

    // Создаём адаптер для better-sqlite3
    const db = betterSqlite3(url.replace('file:', ''));
    const adapter = new PrismaBetterSqlite3(db);

    super({ adapter });
  }

  async onModuleInit() {
    // Подключение открывается автоматически
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
