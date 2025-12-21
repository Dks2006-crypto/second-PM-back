import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  positionId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
