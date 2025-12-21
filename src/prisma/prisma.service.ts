import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL') || 'file:./dev.db';

    const adapter = new PrismaBetterSqlite3({ url });

    super({ adapter });
  }

  async onModuleInit() {
    // Подключение открывается автоматически при первом запросе
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}