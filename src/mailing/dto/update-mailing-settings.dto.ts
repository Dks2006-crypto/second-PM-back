import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateMailingSettingsDto {
  @IsOptional()
  @IsString()
  sendTime?: string;

  @IsOptional()
  @IsString()
  smtpHost?: string;

  @IsOptional()
  @IsInt()
  smtpPort?: number;

  @IsOptional()
  @IsString()
  smtpUser?: string;

  @IsOptional()
  @IsString()
  smtpPass?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsInt()
  retryAttempts?: number;
}