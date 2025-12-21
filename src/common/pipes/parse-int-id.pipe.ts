import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any) {
    if (value === undefined || value === null) {
      throw new BadRequestException('ID обязателен');
    }

    const val = Number(value);
    if (isNaN(val) || !Number.isInteger(val) || val <= 0) {
      throw new BadRequestException(
        'ID должен быть положительным целым числом',
      );
    }
    return val;
  }
}
