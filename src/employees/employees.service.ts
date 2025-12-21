import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  // CRUD только для HR
  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ForbiddenException('Сотрудник с таким email уже существует');
    }

    // Преобразуем YYYY-MM-DD в полный ISO с временем 00:00:00Z
    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new ForbiddenException('Некорректная дата рождения');
    }
    // Устанавливаем время на полночь UTC
    birthDate.setUTCHours(0, 0, 0, 0);

    return this.prisma.employee.create({
      data: {
        ...dto,
        birthDate: birthDate.toISOString(), // Теперь правильный формат
      },
      include: {
        department: true,
        position: true,
        user: { select: { email: true, role: { select: { name: true } } } },
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        position: true,
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
    if (!employee) {
      throw new NotFoundException('Сотрудник не найден');
    }
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: dto,
      include: {
        department: true,
        position: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  // Специальный метод для сотрудника — просмотр своих данных
  async findMyProfile(userId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Ваш профиль сотрудника не найден');
    }

    return employee;
  }

  // Для календаря дней рождения (доступно всем авторизованным)
  async getBirthdayList() {
    return this.prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        department: { select: { name: true } },
      },
      orderBy: { birthDate: 'asc' },
    });
  }
}