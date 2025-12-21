import { Module } from '@nestjs/common';
import { CardTemplatesService } from './card-templates.service';
import { CardTemplatesController } from './card-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CardTemplatesController],
  providers: [CardTemplatesService],
  exports: [CardTemplatesService],
})
export class CardTemplatesModule {}