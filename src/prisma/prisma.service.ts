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
  }

  async onModuleInit() {
    await this.$connect();
    console.log('PrismaService initialized successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}