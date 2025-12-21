import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

@Global() // Делаем модуль и его провайдеры (включая ConfigService) глобальными
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Важно: делает ConfigService доступным везде без импорта
      envFilePath: '.env',
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
