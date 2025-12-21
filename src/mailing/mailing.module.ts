import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CardGeneratorModule } from '../card-generator/card-generator.module';
import { MailingController } from './mailing.controller';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, CardGeneratorModule],
  providers: [MailingService],
  controllers: [MailingController],
})
export class MailingModule {}