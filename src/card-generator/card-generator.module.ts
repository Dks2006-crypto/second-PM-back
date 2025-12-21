import { Module } from '@nestjs/common';
import { CardGeneratorService } from './card-generator.service';

@Module({
  providers: [CardGeneratorService],
  exports: [CardGeneratorService],
})
export class CardGeneratorModule {}
