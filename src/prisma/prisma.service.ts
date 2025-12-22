import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super();

    const url =
      configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      'file:./dev.db';

    console.log('Using DATABASE_URL:', url);
  }

  async onModuleInit() {
    await this.$connect();
    console.log('PrismaService initialized successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
