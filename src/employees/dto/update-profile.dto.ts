import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
  MinLength,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  // Настройки уведомлений
  @IsOptional()
  @IsBoolean()
  receiveEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  receiveInApp?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  reminderDaysBefore?: number;

  @IsOptional()
  @IsString()
  sendTime?: string;

  @IsOptional()
  @IsBoolean()
  showBirthdayPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCardPersonalization?: boolean;

  // Смена пароля
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Новый пароль должен содержать минимум 6 символов' })
  newPassword?: string;
}
