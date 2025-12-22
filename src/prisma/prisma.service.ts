import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import betterSqlite3 from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    let url = configService.get<string>('DATABASE_URL');

    if (!url) {
      url = 'file:/app/data/dev.db';
    }

    const dbPath = url.replace(/^file:/, '');
    const db = betterSqlite3(dbPath);
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
