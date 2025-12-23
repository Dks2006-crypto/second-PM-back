import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}
