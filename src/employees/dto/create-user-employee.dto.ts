import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsDateString,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateUserEmployeeDto {
  // Данные пользователя
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsIn(['employee', 'hr'])
  role: string;

  // Данные сотрудника
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  positionId?: number;
}
