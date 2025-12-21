import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class CreateCardTemplateDto {
  @IsString()
  name: string;

  @IsUrl()
  backgroundImageUrl: string;

  @IsString()
  textTemplate: string; // Поддержка {name} для подстановки

  @IsInt()
  @Min(10)
  fontSize: number;

  @IsString()
  fontColor: string; // Например "#FFFFFF"

  @IsInt()
  @Min(0)
  textX: number;

  @IsInt()
  @Min(0)
  textY: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  positionId?: number;
}